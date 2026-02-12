const BaseHandler = require('/opt/modules/common/basehandler');
const responseHelper = require('/opt/modules/common/response');
const awsmanager = require('/opt/modules/common/awsmanager');
const { STAGE, DB_TENANT} = process.env;
const SQLHelper = require('/opt/modules/common/mysql_helper');

class GetMonitoringAgentQueriesByLambdaName extends BaseHandler {
    constructor() {
        super();
    }
    async process(event, context, callback) {
    try {
        
        const awsManager = new awsmanager();
        let functionName = event.pathParameters.functionName
        const connection = await awsManager.createConnectionWithTenantDb(STAGE, "finzly", awsManager);
        const sqlHelper = new SQLHelper(connection);
        let condition =`lambda_name = '${ functionName }';`
        let result = await sqlHelper.selectWithPreQuery("galaxy_monitoring.monitoring_agent_queries","*",condition)
        sqlHelper.closeConn();
        return responseHelper.sendSuccessResponse({
            message: result.length > 0 ? "Successfully found relevant Queries" : "No queries found",
            queries: result
        });
        
    }
    catch (e) {
        console.log(e);
        return responseHelper.sendServerErrorResponse({
            message: "Request has been failed.",
            functions: []
        });
        //this.log.info("Exception in logCHECK function :", err)
    }
    }
}

exports.get_monitoring_agent_queries_by_lambda = async (event, context, callback) => {
    return await new GetMonitoringAgentQueriesByLambdaName().handler(event, context, callback);
};