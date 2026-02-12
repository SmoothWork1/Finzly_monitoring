const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, assignMonitoringEvent } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class AssignMonitoringEvent extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
			let body = event.body ? JSON.parse(event.body) : event;
            const awsManager = new awsmanager();

			if((body.user_id !== null && !body.user_id) || !body.event_id) {
                return responseHandler.sendBadReqResponse({message: 'Invalid request.'});
            }

            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);
            
            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            let assignment = await assignMonitoringEvent(dbHelper, body.user_id, body.event_id);
            dbHelper.conn.end();
            if (assignment) {
                let resp = {
                    event: assignment
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Monitoring event could not be assigned.'});
            }
        } catch(e) {
            this.log.error("Assign event error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Event could not be assigned.'});
        }
    }
}

exports.assign_monitoring_event = async(event, context, callback) => {
    return await new AssignMonitoringEvent().handler(event, context, callback);
};