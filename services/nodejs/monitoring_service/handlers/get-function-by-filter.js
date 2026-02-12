const BaseHandler = require('/opt/modules/common/basehandler');
const responseHelper = require('/opt/modules/common/response');
const AWS = require("aws-sdk");
const awsmanager = require('/opt/modules/common/awsmanager');
const { CROSSACCOUNT_ID, CROSSACCOUNT_ROLE, SCHEDULERS_FUNCTION_SEARCH_STRING } = process.env;

class GetFunctionByFilter extends BaseHandler {
    constructor() {
        super();
    }
    async process(event, context, callback) {
        const getAllFunction = async (lambda_search_filter) => {
            const awsManager = new awsmanager();
            /*const roleArn = `arn:aws:iam::${CROSSACCOUNT_ID}:role/${CROSSACCOUNT_ROLE}`;
            const assumedRole = await awsManager.assumeRole(roleArn);
            const accessparams = {
                region:'us-east-2',
                accessKeyId: assumedRole.Credentials.AccessKeyId,
                secretAccessKey: assumedRole.Credentials.SecretAccessKey,
                sessionToken: assumedRole.Credentials.SessionToken,
            };

            const lambda = new AWS.Lambda(accessparams);
            */
            const lambda = new AWS.Lambda();
            let filteredFunctions = [];
            let marker= null;
        
            do {
                const response= await lambda.listFunctions({ Marker: marker }).promise();            
                console.log('---------------');
                console.log(response);
                console.log('---------------');
                if (response.Functions) {
                    const functionsOnPage= response.Functions.filter(func => func.FunctionName.includes(lambda_search_filter));                    
                    functionsOnPage.forEach(func => {
                    filteredFunctions.push({
                        functionName: func.FunctionName,
                        functionArn: func.FunctionArn,
                        runtime: func.Runtime,
                        lastModified: func.LastModified
                        });
                    });
                } 
                marker = response.NextMarker;
            } while (marker);
            return filteredFunctions;
        }

        try {
            let lambda_search_filter = SCHEDULERS_FUNCTION_SEARCH_STRING;
            let getFunctionDetails = await getAllFunction(lambda_search_filter);

            return responseHelper.sendSuccessResponse({
                message: getFunctionDetails.length > 0 ? "Successfully found function(s)" : "No function(s) found",
                functions: getFunctionDetails
            });
        } catch (e) {
            console.log(e);
            console.log('##################################')
            this.log.error("Error: ", e);
            return responseHelper.sendServerErrorResponse({
                message: "Request has been failed.",
                functions: []
            });
        }
    }
}

exports.get_function_by_filter = async (event, context, callback) => {
    return await new GetFunctionByFilter().handler(event, context, callback);
};