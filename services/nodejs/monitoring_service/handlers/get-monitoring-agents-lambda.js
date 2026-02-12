const BaseHandler = require('/opt/modules/common/basehandler');
const responseHelper = require('/opt/modules/common/response');
const awsmanager = require('/opt/modules/common/awsmanager');
const { STAGE, DB_TENANT} = process.env;
const SQLHelper = require('/opt/modules/common/mysql_helper');

class GetMonitoringAgentsLambda extends BaseHandler {
    constructor() {
        super();
    }
    async process(event, context, callback) {
    try {
        
        const awsManager = new awsmanager();
        const connection = await awsManager.createConnectionWithTenantDb(STAGE, "finzly", awsManager);
        const sqlHelper = new SQLHelper(connection);
        let result = await sqlHelper.select("galaxy_monitoring.monitoring_agent_queries","lambda_name");
        sqlHelper.closeConn();
        const lambdaNames = result.map(func => func.lambda_name);
   
        return responseHelper.sendSuccessResponse({
            message: result.length > 0 ? "Successfully found relevant Queries" : "No queries found",
            lambdas: lambdaNames
        });
        
    }
    catch (e) {
        console.log(e);
        return responseHelper.sendServerErrorResponse({
            message: "Request has been failed.",
            lambdas: []
        });
        //this.log.info("Exception in logCHECK function :", err)
    }
    }
}

exports.get_monitoring_agents_lambda = async (event, context, callback) => {
    return await new GetMonitoringAgentsLambda().handler(event, context, callback);
};