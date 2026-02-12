const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, getAgentQueries } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class Get_Agent_Queries extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            let lambda_name = event.pathParameters.lambda;
            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            let queries = await getAgentQueries(dbHelper, lambda_name);
            dbHelper.conn.end();
            if (queries) {
                let resp = {
                    queries
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Agent queries could not be fetched.'});
            }
        } catch(e) {
            this.log.error("Get agent queries error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Agent queries could not be fetched.'});
        }
    }
}

exports.get_agent_queries = async(event, context, callback) => {
    return await new Get_Agent_Queries().handler(event, context, callback);
};