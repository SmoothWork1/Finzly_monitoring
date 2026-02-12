const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const utils = require('/opt/modules/common/utils');
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, removeMonitoringUserByEmail } = require("./helper/sql-monitoring.js");
const { STAGE, cognito_pool_id } = process.env;

class Remove_User extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
			let body = event.body ? JSON.parse(event.body) : event;
            const awsManager = new awsmanager();
            await utils.validate(body, helper.get_remove_user_schema());
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            let monitoring_user = await removeMonitoringUserByEmail(dbHelper, body.email);
            dbHelper.conn.end();
            await awsManager.deleteUserFromPool(body.email, cognito_pool_id);
            if (monitoring_user) {
                let resp = {
                    message: "Removed monitoring user successfully"
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Monitoring user could not be removed.'});
            }
        } catch(e) {
            this.log.error("Remove monitoring user error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Could not remove monitoring user.'});
        }
    }
}

exports.remove_user = async(event, context, callback) => {
    return await new Remove_User().handler(event, context, callback);
};