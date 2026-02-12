const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, getMonitoringEventFunctionNames } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class GetEventFunctionNames extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            const event_type = event.pathParameters.type;
            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            let conditionQuery = helper.convertEventTypeToQueryCondition(event_type, 'event_type');
            let functions = await getMonitoringEventFunctionNames(dbHelper, conditionQuery);
            dbHelper.conn.end();
            if (functions) {
                let resp = {
                    functions
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Event function names could not be fetched.'});
            }
        } catch(e) {
            this.log.error("Get event function names error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Event function names could not be fetched.'});
        }
    }
}

exports.get_event_function_names = async(event, context, callback) => {
    return await new GetEventFunctionNames().handler(event, context, callback);
};