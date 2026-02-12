const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, notificationViewedByUser } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class NotificationViewed extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
			let body = event.body ? JSON.parse(event.body) : event;
            const awsManager = new awsmanager();

			if(!body.user_id || !body.event_id) {
                return responseHandler.sendBadReqResponse({message: 'Invalid request.'});
            }

            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            let notif = await notificationViewedByUser(dbHelper, body.user_id, body.event_id);
            dbHelper.conn.end();
            if (notif) {
                let resp = {
                    event: notif
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Monitoring notification view could not be added.'});
            }
        } catch(e) {
            this.log.error("Notification viewed error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Notification view could not be added.'});
        }
    }
}

exports.notification_viewed = async(event, context, callback) => {
    return await new NotificationViewed().handler(event, context, callback);
};