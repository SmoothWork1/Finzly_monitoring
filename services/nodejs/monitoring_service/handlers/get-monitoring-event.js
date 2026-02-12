const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringEvents, getMonitoringCommentsByEventId, getMonitoringUserByID } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class GetMonitoringEvent extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            const event_id = event.pathParameters.id;
            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);
            
            const user = await getMonitoringUserByID(dbHelper, this.user_id);
            if(user.type === 'Other User' && (this.tenant_name != user.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }
            
            const eventConditionQuery = user.type === 'Other User' ?
                `event_id = '${event_id}' AND tenant_name = '${user.tenant_id}'`
            :
                `event_id = '${event_id}'`;
            // const eventConditionQuery = `event_id = '${event_id}' AND tenant_name = '${this.tenant_name}'`;
            const monitoringEvent = (await getMonitoringEvents(dbHelper, eventConditionQuery))[0];
            if (monitoringEvent) {
                const commentConditionQuery = `event_id = '${event_id}' ORDER BY created_at DESC`;
                let comments = await getMonitoringCommentsByEventId(dbHelper, commentConditionQuery);
                comments = await Promise.all(comments.map( async (c) => ({
                    ...c,
                    email: (await getMonitoringUserByID(dbHelper, c.user_id)).email
                })));
                dbHelper.conn.end();
                let resp = {
                    event: monitoringEvent,
                    comments
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                dbHelper.conn.end();
                return responseHandler.sendBadReqResponse({message: 'Monitoring event could not be fetched.'});
            }
        } catch(e) {
            this.log.error("Get event error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Event could not be fetched.'});
        }
    }
}

exports.get_monitoring_event = async(event, context, callback) => {
    return await new GetMonitoringEvent().handler(event, context, callback);
};