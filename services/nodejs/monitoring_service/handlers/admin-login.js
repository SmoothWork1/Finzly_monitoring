const responseHandler = require('/opt/modules/common/response');
const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByEmail } = require('./helper/sql-monitoring.js');
const { cognito_client, STAGE, DB_TENANT } = process.env;

class Admin_Login extends BaseHandler {
    // this is main function
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            const tenant_name = DB_TENANT;
            let body = event.body ? JSON.parse(event.body) : event;
            let awsManager = new awsmanager();

            if(!body.username || !body.password) {
                return responseHandler.sendBadReqResponse({message: 'Invalid request.'});
            }

            const dbHelper = await helper.create_db_connection(STAGE, tenant_name, awsManager);
            let loginResp = await awsManager.login(cognito_client, body.username, body.password);
            let resp;
            const customer = await getMonitoringUserByEmail(dbHelper,/* tenant_name, */ body.username);
            dbHelper.conn.end();
            if (customer) {
                resp = {
                    id: customer.id,
                    email: customer.email,
                    first_name: customer.first_name,
                    last_name: customer.last_name,
                    contact_number: customer.contact_number,
                    address: customer.address,
                    type: customer.type,
                    devops_type: customer.devops_type,
                    sub: loginResp.sub,
                    message: "Login successful"
                };
            } else if(!customer) {
                return responseHandler.sendBadReqResponse({message: 'Admin not found.'});
            }

            if (loginResp && resp) {
                return responseHandler.sendSuccessResponseWithHeaders(resp, {token: loginResp.AuthenticationResult.IdToken});
            } else {
                return responseHandler.sendBadReqResponse({message: "Login failed"});
            }
        } catch(e) {
            this.log.error("Admin login error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Login failed.'});
        }
    }
}

exports.admin_login = async(event, context, callback) => {
    return await new Admin_Login().handler(event, context, callback);
};