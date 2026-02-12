const responseHandler = require('/opt/modules/common/response');
const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByEmail } = require('./helper/sql-monitoring.js');
const { cognito_client, STAGE,DB_TENANT } = process.env;

class Forgot_Password extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        // this.log.debug(event);
        let body = event.body ? JSON.parse(event.body) : event;
        if (!body.username) {
            return responseHandler.sendBadReqResponse({message: 'Invalid Request'});
        }
        const tenant_name = DB_TENANT;
        let awsManager = new awsmanager();
        const dbHelper = await helper.create_db_connection(STAGE, tenant_name, awsManager);
        let admin =  await getMonitoringUserByEmail(dbHelper, body.username);
        dbHelper.conn.end();
        if (admin == null)
            return responseHandler.sendBadReqResponse({message: 'Invalid Information'});

        let confirmSignUpResponse = await awsManager.forgotPassword(cognito_client, body.username);
        if (confirmSignUpResponse == null) {
            return responseHandler.sendBadReqResponse({message: 'Invalid Information'});
		} else {
            let resp = {
                message: "Confirmation Code sent to your Email ID"
            };
            return responseHandler.sendSuccessResponse(resp);
        }
    }
}

exports.forgot_password = async (event, context, callback) => {
    return await new Forgot_Password().handler(event, context, callback);
};