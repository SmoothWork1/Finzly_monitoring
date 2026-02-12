const AuthPolicy = require('aws-auth-policy');
const log4js = require('log4js');
const logger = log4js.getLogger();
const jwt = require('jsonwebtoken');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
let PEMS = null;
logger.level = process.env.LOG_LEVEL;
const toPem = (keyDictionary) => {
    return jwkToPem(Object.assign({}, {
        kty: keyDictionary.kty,
        n: keyDictionary.n,
        e: keyDictionary.e
    }));
};
// This method is used to create deny all policy
const deny = (awsAccountId, apiOptions) => {
    logger.info('Inside deny', awsAccountId, apiOptions);
    let policy = new AuthPolicy('', awsAccountId, apiOptions);
    policy.denyAllMethods();
    let iamPolicy = policy.build();
    return iamPolicy;
};
// This method is used to get the jkws file
const getJWKS = async (jwtKeySetURI) => {
    console.time(`AUTHORIZER:getJWKS`);
    return new Promise((resolve, reject) => {
        request({
            url: jwtKeySetURI,
            json: true
        }, (error, response, body) => {
            console.timeEnd(`AUTHORIZER:getJWKS`);
            if (!error && response.statusCode === 200) {
                let pems = {};
                let keys = body['keys'];
                for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
                    let kid = keys[keyIndex].kid;
                    pems[kid] = toPem(keys[keyIndex]);
                }
                resolve(pems);
            }
            else {
                logger.info("Failed to retrieve the keys from the well known user-pool URI, ");
                logger.info('Error-Code: ', response.statusCode);
                logger.info(error);
                //resolve(null);
                reject(error);
            }
        });
    });
};
// this function used to verify JWT
const verifyJWT = async (token, pem, tokenIssuer) => {
    console.time(`AUTHORIZER:verifyJWT`);
    return new Promise(resolve => {
        jwt.verify(token, pem, {
            issuer: tokenIssuer
        }, function (err, payload) {
            console.timeEnd(`AUTHORIZER:verifyJWT`);
            if (err) {
                logger.info("Error while trying to verify the Token, returning deny-all policy", err.message);
                resolve(null);
            }
            resolve(payload);
        });
    });
};
// This function is used to process the request
const processAuthRequest = async ({ token, header, payload: { token_use, iss: tokenIssuer } }, awsAccountId, apiOptions) => {
    const { kid } = header;
    // Reject the jwt if it's not an 'Identity Token'
    if (token_use != 'id') {
        logger.info("Provided Token is not an identity token, returning deny all policy");
        return deny(awsAccountId, apiOptions);
    }
    // Get the kid from the token and retrieve corresponding PEM
    let pem = PEMS[kid];
    if (!pem) {
        logger.info("Invalid Identity token, returning deny all policy");
        return deny(awsAccountId, apiOptions);
    }
    // Verify the signature of the JWT token to ensure it's really coming from your User Pool
    const payload = await verifyJWT(token, pem, tokenIssuer);
    logger.info('payload', payload);
    if (!payload) {
        return deny(awsAccountId, apiOptions);
    } else {
        const pId = payload.sub;
        let policy = new AuthPolicy(pId, awsAccountId, apiOptions);
        // Get all the config
        let context = {};
        policy.allowMethod("*", "*");
        let iamPolicy = policy.build();
        let pool = tokenIssuer.substring(tokenIssuer.lastIndexOf('/') + 1);
        try {
            context.pool = pool;
            context.user = JSON.stringify(payload);
        } catch (e) {
            logger.error(e);
        }
        iamPolicy.context = context;
        console.timeEnd(`AUTHORIZER`);
        return iamPolicy;
    }
};
const getStrippedPath = (path, resource, pathParameters) => {
    var basePath = path;
    if (resource != "/") {
        Object.entries(pathParameters).forEach(entry => {
          let key = entry[0];
          let value = entry[1];
          resource = resource.replace('{' + key + '}', value)
        });
        var basePath = path.split(resource)[0]
    }
    return basePath.trim();
}
exports.handler = async (event, context, callback) => {
    console.time(`AUTHORIZER`);
    console.log('Inside event', event);
    const tmp = event.methodArn.split(':');
    const apiGatewayArnTmp = tmp[5].split('/');
    const awsAccountId = tmp[4];
    const apiOptions = {
        region: tmp[3],
        restApiId: apiGatewayArnTmp[0],
        stage: apiGatewayArnTmp[1]
    };
    const httpMethod = event.httpMethod
    const resource = event.resource
    const basePath = getStrippedPath(event.path, resource, event.pathParameters)
    logger.debug(event);
    logger.debug(apiGatewayArnTmp);
    try {
        const token = event.headers.Authorization ? event.headers.Authorization : event.headers.authorization;
        const decoded = jwt.decode(token, {
            complete: true
        });
        if (!decoded) {
            logger.info('denied due to decoded error');
            return deny(awsAccountId, apiOptions);
        }
        const userPoolURI = `${decoded.payload.iss}`;
        const jwtKeySetURI = `${userPoolURI}/.well-known/jwks.json`;
        try {
            PEMS = await getJWKS(jwtKeySetURI);
        }
        catch (e) {
            console.log(e);
            console.timeEnd(`AUTHORIZER`);
            return deny(awsAccountId, apiOptions);
        }
        return await processAuthRequest({ ...decoded, token: token }, awsAccountId, apiOptions);
    }
    catch (err) {
        logger.error(err);
    }
    console.timeEnd(`AUTHORIZER`);
    return deny(awsAccountId, apiOptions);
};