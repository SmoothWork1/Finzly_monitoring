const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, getHeartbeats } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class GetHeartbeats extends BaseHandler {
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

            const beats = await getHeartbeats(dbHelper);
            dbHelper.conn.end();
            if (beats) {
                let resp = {
                    beats,
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Monitoring events could not be fetched.'});
            }
        } catch(e) {
            this.log.error("Get heartbeats error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Heartbeats could not be fetched.'});
        }
    }
}

exports.get_heartbeats = async(event, context, callback) => {
    return await new GetHeartbeats().handler(event, context, callback);
};