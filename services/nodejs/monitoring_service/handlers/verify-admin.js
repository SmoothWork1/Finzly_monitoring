const responseHandler = require('/opt/modules/common/response');
const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByEmail } = require('./helper/sql-monitoring.js');
const { cognito_client, STAGE, DB_TENANT } = process.env;

class Verify_Admin extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        // this.log.debug(event);
        let body = event.body ? JSON.parse(event.body) : event;
        if (!body.username || !body.confirmation_code) {
            return responseHandler.sendBadReqResponse({message: 'Invalid Request'});
        }
        const tenant_name = DB_TENANT;
        let awsManager = new awsmanager();
        const dbHelper = await helper.create_db_connection(STAGE, tenant_name, awsManager);
        let admin =  await getMonitoringUserByEmail(dbHelper, body.username);
        dbHelper.conn.end();
        if (admin == null)
            return responseHandler.sendBadReqResponse({message: 'Invalid Information'});

        let confirmSignUpResponse = await awsManager.confirmSignUp(cognito_client, body.confirmation_code, body.username);
        if (confirmSignUpResponse == null) {
            return responseHandler.sendBadReqResponse({message: 'Invalid Information'});
		} else {
            let resp = {
                message: "Verification Successful"
            };
            return responseHandler.sendSuccessResponse(resp);
        }
    }
}

exports.verify_admin = async (event, context, callback) => {
    return await new Verify_Admin().handler(event, context, callback);
};