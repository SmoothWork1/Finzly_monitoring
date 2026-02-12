const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getEventCountByType, getMonitoringUserByID, getEventCountByTypeAndTenant } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class GetRecentEventsByType extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);
            // let events = await awsManager.getTodayEventCountByType();
            
            const user = await getMonitoringUserByID(dbHelper, this.user_id);
            if(user.type === 'Other User' && (this.tenant_name != user.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            let events = user.type === 'Other User' ?
                await getEventCountByTypeAndTenant(dbHelper, user.tenant_id)
            :
                await getEventCountByType(dbHelper);
            // events = [...events, ...(await awsManager.getScheduledEventCountByType())];
            dbHelper.conn.end();
            const eventsObj = helper.sortEventTypeCounts(events);
            if (eventsObj) {
                let resp = {
                    counts: eventsObj
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Monitoring event badges could not be fetched.'});
            }
        } catch(e) {
            this.log.error("Get event badges error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Event badges could not be fetched.'});
        }
    }
}

exports.get_recent_events_by_type = async(event, context, callback) => {
    return await new GetRecentEventsByType().handler(event, context, callback);
};