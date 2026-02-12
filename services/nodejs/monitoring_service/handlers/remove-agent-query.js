const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, rmAgentQuery } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class Remove_Agent_Query extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
			let lambda_name = event.pathParameters.lambda;
			let query_name = decodeURIComponent(event.pathParameters.query);
            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            let agent_query = await rmAgentQuery(dbHelper, {lambda_name, query_name});
            dbHelper.conn.end();
            if (agent_query) {
                let resp = {
                    message: "Removed agent query successfully"
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Agent query could not be removed.'});
            }
        } catch(e) {
            this.log.error("Remove agent query error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Could not remove agent query.'});
        }
    }
}

exports.remove_agent_query = async(event, context, callback) => {
    return await new Remove_Agent_Query().handler(event, context, callback);
};