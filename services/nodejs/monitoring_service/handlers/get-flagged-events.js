const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, getFlaggedEvents } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class Get_Flagged_Events extends BaseHandler {
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

            let flags = await getFlaggedEvents(dbHelper);
            dbHelper.conn.end();
            if (flags) {
                let resp = {
                    flags
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Flagged events could not be fetched.'});
            }
        } catch(e) {
            this.log.error("Get flagged events error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Flagged events could not be fetched.'});
        }
    }
}

exports.get_flagged_events = async(event, context, callback) => {
    return await new Get_Flagged_Events().handler(event, context, callback);
};