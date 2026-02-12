const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringEventCount, getMonitoringEvents, getMonitoringUserByID } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class GetMonitoringEvents extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            const event_type = event.pathParameters.type;
            const page = parseInt(event.pathParameters.page);
            const filter_type = event.pathParameters.filter;
            const query = event.queryStringParameters;
            const size = 10;
            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            let conditionQuery = helper.convertEventTypeToQueryCondition(event_type, 'event_type');
            // const initConditionQuery = conditionQuery;
            if(filter_type === 'today') {
                const CDT = new Date();
                CDT.setHours(CDT.getHours()-5);
                let day = CDT.getDate();
                day = day < 10 ? '0'+day : day;
                let month = CDT.getMonth()+1;
                month = month < 10 ? '0'+month : month;
                const CDTstr = `${CDT.getFullYear()}-${month}-${day}`;
                conditionQuery += ` AND status = 'Active' AND DATE(created_at) = '${CDTstr}'`;
            }
            if(filter_type === 'all') {
                conditionQuery += ` AND status = 'Active'`;
            }
            if(filter_type === 'user') {
                conditionQuery += ` AND status = 'Active' AND user_id = '${this.user_id}'`;
            }
            if(filter_type === 'custom') {
                if(query.status !== "Any") {
                    conditionQuery += ` AND status = '${query.status}'`;
                }
                if(query.severity !== "" && query.severity !== "Any") {
                    conditionQuery += ` AND severity = '${query.severity}'`;
                }
                if(query.startDate) {
                    conditionQuery += ` AND created_at >= '${query.startDate}'`;
                }
                if(query.endDate) {
                    conditionQuery += ` AND created_at < '${query.endDate}'`;
                }
                if(query.source_system) {
                    conditionQuery += ` AND source_system LIKE '%${query.source_system}%'`;
                }
                if(query.event_id) {
                    conditionQuery += ` AND event_id LIKE '%${query.event_id}%'`;
                }
                if(query.description) {
                    conditionQuery += ` AND description LIKE '%${query.description}%'`;
                }
            }
            //conditionQuery += ` AND tenant_name = '${this.tenant_name}'`;
            const user = await getMonitoringUserByID(dbHelper, this.user_id);
            if(user.type === 'Other User' && (this.tenant_name != user.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            conditionQuery += user.type === 'Other User' ? ` AND tenant_name = '${user.tenant_id}'` : '';
            console.log("CONDITION QUERY: ", conditionQuery);
            // let total = await awsManager.getMonitoringEventCount(initConditionQuery);
            const total = await getMonitoringEventCount(dbHelper, conditionQuery);
            console.log("TOTAL: ", total);
            conditionQuery += ` ORDER BY created_at DESC LIMIT ${(page-1)*size},${size}`;
            const events = await getMonitoringEvents(dbHelper, conditionQuery);
            console.log("EVENTS: ", total);
            dbHelper.conn.end();
            if (events) {
                let resp = {
                    events,
                    total
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Monitoring events could not be fetched.'});
            }
        } catch(e) {
            this.log.error("Get events error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Events could not be fetched.'});
        }
    }
}

exports.get_monitoring_events = async(event, context, callback) => {
    return await new GetMonitoringEvents().handler(event, context, callback);
};