const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const AWS = require("aws-sdk");
const helper = require('./helper.js');
const responseHelper = require('/opt/modules/common/response');
const { STAGE,MONITORING_SQS_NAME,REGION} = process.env;
const ENUM = require('./enum.js')
const SQLHelper = require('/opt/modules/common/mysql_helper');
const CHANNEL_ACH = "";
const CHANNEL_FEDWIRE = "";
const MONITORING_SERVICE_URL = process.env.MONITORING_SERVICE_URL;
const API_KEY = process.env.API_KEY;
class StuckFutureDatedPayments extends BaseHandler {
    constructor() {
        super();
    }
    async check_payments(tenant_name, qry , connection, awsManager) {
        qry = qry.replace(/%%TENANT_NAME%%/g, tenant_name)
        //const results = await awsManager.executeQuery(qry,connection);
        const results = await helper.query(qry,connection);
        const records = []
        if(results){
            for(const result of results){
                records.push({
                    "Tenant":tenant_name,
                    "Status":result.status,
                    "Count":result.count,
                    "PaymentIds":result.paymentIds
                });
            }
        }else{
            console.log(`No stuck future dated payments found: ${qry}`);
        }
        return records
    }
    async process(event, context, callback) {
        const awsManager = new awsmanager();
        var monitoring_db_conn  = null;
        try{
            this.log.info(event);
            let error_desc = null;
            let message = "Process completed."
            let SQS = new AWS.SQS({region:REGION});
            monitoring_db_conn = await helper.create_connection_with_monitoring_db(STAGE, awsManager);
            if (!monitoring_db_conn) {
                error_desc = 'Unable to connect to monitoring  database';
                this.log.error(error_desc);
                throw new Error(`Process failed: ${error_desc}`);
            }
            let condition =`lambda_name = '${ ENUM.queries_identifier.FAILED_MESSAGES }';`
            //let queries = await sqlHelper.selectWithPreQuery("galaxy_finzly.monitoring_agent_queries","*",condition)
            let queries = await helper.fetch_queries(condition,monitoring_db_conn)
            console.log(`#### Queries: ${JSON.stringify(queries)}`);
            //const tenants = await helper.fetchActiveTenants(STAGE,awsManager);
            const all_tenants = await helper.fetchActiveTenants(STAGE,awsManager);
            for(const obj of all_tenants){
                const stg = obj.stage;
                for(const tenant_name of obj.tenants) {
                    var connection = null;
                    if(['oceanfirstbank','snb','finzly'].includes(tenant_name)){
                        continue;
                    }
                    try{
                        //connection = await awsManager.createConnectionWithTenantDb(STAGE, tenant_name, awsManager);
                        connection = await helper.create_connection_with_tenant_db(stg, tenant_name, awsManager);
                        if (!connection) {
                            error_desc = `Not able to read the ${tenant_name} database server properties from parameter store`;
                            throw new Error(`Process failed: ${error_desc}`);
                        }
                        //Check payments of ACH channel
                        const checkPaymentQuery = queries.find(query => query.query_name === ENUM.queries_identifier.CHECK_PAYMENTS);                   
                        var results = await this.check_payments(tenant_name, checkPaymentQuery.query, connection);
                        if(results){
                            const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                            for(const result of results){
                                const event_id = await helper.createEventId(result.Tenant,result.PaymentIds);
                                if(result.Count == 0){
                                    continue;
                                }
                                let obj = {
                                    event_id:event_id,
                                    event_type: 'STUCK_PAYMENTS',
                                    source_system: `Future Dated Payments`,
                                    tenant_name: result.Tenant,
                                    details: JSON.stringify(result),
                                    description:`Payments are stuck in - 'FUTURE_DATED' status`
                                };
                                if (queueUrl) {
                                    const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                    this.log.info("Notification send successfully :: ", obj)
                                }
                            }
                        }
                    }catch(ex){
                        this.log.error(`Failed execute queries for tenant: ${tenant_name}: `, ex);
                        await helper.notify_failure(awsManager,"stuck-future-payments",ex.message);
                    }finally{
                        if (connection != null) {
                            connection.end();
                        }
                    }
                }
            }
            // await helper.register_heartbeat(
            //     `${MONITORING_SERVICE_URL}/heartbeat`,
            //     API_KEY,
            //     awsManager,
            //     'STUCK_PAYMENTS',
            //     'BankOS Tenants',
            //     `Stuck Payments - ACH, FEDWIRE, RTP etc`
            // );
        } catch (err) {
            this.log.error(`Internal Server Error: `, err);
            await helper.notify_failure(awsManager,"stuck-future-payments",err.message);
            return responseHelper.sendServerErrorResponse({
                message: err.message
            })
        }finally{
            if (monitoring_db_conn && monitoring_db_conn.end) {
                monitoring_db_conn.end();
            }
        }
    }
}
exports.scheduler = async (event, context, callback) => {
    return await new StuckFutureDatedPayments().handler(event, context, callback);
};