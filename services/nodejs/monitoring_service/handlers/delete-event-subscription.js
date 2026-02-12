const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, unsubscribeEvent } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class Delete_Event_Subscription extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
			let subscription_id = event.pathParameters.subscriptionid;
            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            let subscription = await unsubscribeEvent(dbHelper, subscription_id);
            dbHelper.conn.end();
            if (subscription) {
                let resp = {
                    message: "Unsubscribed event successfully"
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Event subcription could not be removed.'});
            }
        } catch(e) {
            this.log.error("Unsubscribe event error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Could not unsubscribe from event.'});
        }
    }
}

exports.delete_event_subscription = async(event, context, callback) => {
    return await new Delete_Event_Subscription().handler(event, context, callback);
};