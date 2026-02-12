const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, getActiveEvents, getViewedNotifications, notificationViewedByUser } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class ClearNotifications extends BaseHandler {
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

            const events = await getActiveEvents(dbHelper, this.tenant_name, "Active");
            const viewed = await getViewedNotifications(dbHelper, this.user_id);
            const cleanViewed = viewed.map( (v) => v.event_id );
            const filteredEvents = events.filter( (e) => 
                                    cleanViewed.indexOf(e.event_id) === -1
                                    && e.event_type !== 'RUNTIME_EXCEPTIONS'
                                );
            if (filteredEvents) {
                for(let i = 0; i <= filteredEvents.length; ++i) {
                    if(i === filteredEvents.length) {
                        dbHelper.conn.end();
                        return responseHandler.sendSuccessResponse({message: 'Notifications cleared.'});
                    } else {
                        await notificationViewedByUser(dbHelper, this.user_id, filteredEvents[i].event_id);
                    }
                }
            } else {
                dbHelper.conn.end();
                return responseHandler.sendBadReqResponse({message: 'Notifications could not be cleared.'});
            }
        } catch(e) {
            this.log.error("Get notifications error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Notifications could not be cleared.'});
        }
    }
}

exports.clear_notifications = async(event, context, callback) => {
    return await new ClearNotifications().handler(event, context, callback);
};