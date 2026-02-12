const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, getSubscribedEvents } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class Get_Event_Subscriptions extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
			// let user_id = event.pathParameters.userid;
			let user_id = this.user_id;
            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            let subscriptions = await getSubscribedEvents(dbHelper, user_id);
            dbHelper.conn.end();
            if (subscriptions) {
                let resp = {
                    subscriptions
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Subscribed events could not be fetched.'});
            }
        } catch(e) {
            this.log.error("Get subscribed events error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Subscribed events could not be fetched.'});
        }
    }
}

exports.get_event_subscriptions = async(event, context, callback) => {
    return await new Get_Event_Subscriptions().handler(event, context, callback);
};