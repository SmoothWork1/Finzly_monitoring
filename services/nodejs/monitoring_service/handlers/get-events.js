const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, getEvents, getEventsTotal } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class GetEvents extends BaseHandler {
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

            const page = parseInt(event.pathParameters.page);
            if(!page) {
                let events = await getEvents(dbHelper);
                dbHelper.conn.end();
                if (events) {
                    let resp = {
                        events
                    };
                    return responseHandler.sendSuccessResponse(resp);
                } else {
                    return responseHandler.sendBadReqResponse({message: 'Events could not be fetched.'});
                }
            }

            const query = event.queryStringParameters;
            const size = 10;
            const conditions = [];
            if(query.name) {
                conditions.push(`name LIKE '%${query.name}%'`);
            }
            if(query.configuration) {
                conditions.push(`configuration LIKE '%${query.configuration}%'`);
            }
            if(query.application) {
                conditions.push(`application LIKE '%${query.application}%'`);
            }
            if(query.platform) {
                conditions.push(`platform LIKE '%${query.platform}%'`);
            }
            if(query.event_type) {
                conditions.push(`event_type LIKE '%${query.event_type}%'`);
            }

            const totalConditionStr = conditions.join(" AND ");
            const total = await getEventsTotal(dbHelper, totalConditionStr);
            const conditionStr = `${totalConditionStr ? totalConditionStr+' ' : ''}ORDER BY created_at DESC LIMIT ${(page-1)*size}, ${size}`;
            let events = await getEvents(dbHelper, conditionStr);
            dbHelper.conn.end();
            if (events) {
                let resp = {
                    events,
                    total
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Events could not be fetched.'});
            }
        } catch(e) {
            this.log.error("Get events error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Events could not be fetched.'});
        }
    }
}

exports.get_events = async(event, context, callback) => {
    return await new GetEvents().handler(event, context, callback);
};