const responseHandler = require('/opt/modules/common/response');
const BaseHandler = require('/opt/modules/common/basehandler');
const utils = require('/opt/modules/common/utils');
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, insertSubscriptionEvent } = require('./helper/sql-monitoring.js');
const { STAGE } = process.env;

class Create_Event_Subscription extends BaseHandler {
    // this is main function
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            let body = event.body ? JSON.parse(event.body) : event;
            let awsManager = new awsmanager();
            await utils.validate(body, helper.get_subscription_schema());
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            const subscription = await insertSubscriptionEvent(dbHelper,/* this.tenant_name, */ {
                user_id: body.user_id,
                event_type: body.event_type,
                delivery_method: body.delivery_method,
                deliver_to: body.deliver_to,
                tenant_name: body.tenant_name,
            });
            dbHelper.conn.end();
            this.log.info("Event subscribed: ", subscription);
            if (subscription) {
                let resp = {
                    message: "Event subscription successful"
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Event could not be subscribed.'});
            }
        } catch(e) {
            this.log.error("Event subscription error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Event could not be subscribed.'});
        }
    }
}

exports.create_event_subscription = async(event, context, callback) => {
    return await new Create_Event_Subscription().handler(event, context, callback);
};