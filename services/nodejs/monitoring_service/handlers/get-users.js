const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, getMonitoringUsers } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class GetUsers extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            let users = await getMonitoringUsers(dbHelper);
            dbHelper.conn.end();
            if (users) {
                let resp = {
                    users
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Monitoring users could not be fetched.'});
            }
        } catch(e) {
            this.log.error("Get users error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Users could not be fetched.'});
        }
    }
}

exports.get_users = async(event, context, callback) => {
    return await new GetUsers().handler(event, context, callback);
};