const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getActiveEventsByGivenTypes, getMonitoringUserByID } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class BlockDashboard extends BaseHandler {
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
            
            const condQuery = helper.convertEventTypesToQueryCondition('event_type', [
                "prod_issues", "ssl_expirations", "server_health", "payment_failure", "ach_failure", "stuck_payments",
                "rt_exceptions", "app_process_health", "bulkfile", "mq_health", "pass_exp", "up_conns", "vpn_status", /* "sched_maint", */ "rt_messaging",
                "notification", "job"
            ]);
            // const events = await getTodayEventCountByGivenTypes(dbHelper, condQuery);
            // const events = await getTodayEventsByGivenTypes(dbHelper, condQuery);
            const events =
                user.type === 'Other User' ?
                    await getActiveEventsByGivenTypes(dbHelper, `(${condQuery}) AND tenant_name = '${user.tenant_id}'`)
                :
                    await getActiveEventsByGivenTypes(dbHelper, condQuery);
            // const filteredEvents = events.filter( (evt) => {
            //     const details = helper.safelyParseJSONObj(evt.details);
            //     return (details.tenant_id == tenant_id);
            // });
            dbHelper.conn.end();
            const eventsObj = helper.sortEventTypeBlocks(events);
            // const eventsObj = helper.sortEventTypeBlocks(filteredEvents);
            if (eventsObj) {
                let resp = {
                    blocks: eventsObj
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Monitoring event blocks could not be fetched.'});
            }
        } catch(e) {
            this.log.error("Get event blocks error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Event blocks could not be fetched.'});
        }
    }
}

exports.block_dashboard = async(event, context, callback) => {
    return await new BlockDashboard().handler(event, context, callback);
};