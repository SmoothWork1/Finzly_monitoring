const responseHandler = require('/opt/modules/common/response');
const BaseHandler = require('/opt/modules/common/basehandler');
const utils = require('/opt/modules/common/utils');
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, updateAgentQuery } = require('./helper/sql-monitoring.js');
const { STAGE } = process.env;

class Update_Agent_Query extends BaseHandler {
    // this is main function
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            let body = event.body ? JSON.parse(event.body) : event;
            let awsManager = new awsmanager();
            await utils.validate(body, helper.get_agent_query_schema());
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            const agent_query = await updateAgentQuery(dbHelper, {
                query: body.query,
                query_result: body.query_result,
                query_order: body.query_order,
            }, {
                lambda_name: body.lambda_name,
                query_name: body.query_name,
            });
            dbHelper.conn.end();
            this.log.info("Agent query updated: ", agent_query);
            if (agent_query) {
                let resp = {
                    message: "Agent query updated successfully"
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Agent query could not be updated.'});
            }
        } catch(e) {
            this.log.error("Update agent query error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Could not update agent query.'});
        }
    }
}

exports.update_agent_query = async(event, context, callback) => {
    return await new Update_Agent_Query().handler(event, context, callback);
};