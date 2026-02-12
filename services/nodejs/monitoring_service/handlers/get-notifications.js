const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getActiveEvents, getViewedNotifications, getActiveEventsByTenant, getMonitoringUserByID } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class GetNotifications extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);
            
            const user = await getMonitoringUserByID(dbHelper, this.user_id);
            if(user.type === 'Other User' && (this.tenant_name != user.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }
            
            const events = user.type === 'Other User' ?
                await getActiveEventsByTenant(dbHelper, this.tenant_name, "Active", user.tenant_id)
            :
                await getActiveEvents(dbHelper, this.tenant_name, "Active");
            const viewed = await getViewedNotifications(dbHelper, this.user_id);
            dbHelper.conn.end();
            const cleanViewed = viewed.map( (v) => v.event_id );
            const filteredEvents = events.filter( (e) => 
                                    cleanViewed.indexOf(e.event_id) === -1
                                    && e.event_type !== 'RUNTIME_EXCEPTIONS'
                                );
            const more = filteredEvents.length > 10;
            const finalEvents = filteredEvents.slice(0, 10);
            if (finalEvents) {
                const resp = {
                    notifications: finalEvents,
                    more
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Notifications could not be fetched.'});
            }
        } catch(e) {
            this.log.error("Get notifications error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Notifications could not be fetched.'});
        }
    }
}

exports.get_notifications = async(event, context, callback) => {
    return await new GetNotifications().handler(event, context, callback);
};