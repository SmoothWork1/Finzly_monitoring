const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const AWS = require("aws-sdk");
const helper = require('./helper.js');
const ENUM = require('./enum.js')
const responseHelper = require('/opt/modules/common/response');
const { STAGE,MONITORING_SQS_NAME,REGION} = process.env;
//const BANK_RECORD_COUNT_THRESHOLD = 1400000;
//const HOLIDAY_COUNT_THRESHOLD = 60000;
//const IBAN_COUNT_THRESHOLD = 180000;
//const IBAN_STRUCTURE_COUNT_THRESHOLD = 100;
//const RTN_COUNT_THRESHOLD = 16000;
class StaticDataLoadMonitor extends BaseHandler {
    constructor() {
        super();
    }
    async check_job_execution(stage,awsManager,queries,queueUrl,SQS) {
        var connection = null;
        try{
            const tenant_name = 'finzly';
            connection = await helper.create_connection_with_tenant_db(stage, tenant_name, awsManager);
            if (!connection) {
                error_desc = `Not able to read the ${tenant_name} database server properties from parameter store`;
                throw new Error(`${stage} \ Process failed: ${error_desc}`);
            }
            const bankRecordsQry = queries.find(query => query.query_name === 'bank');                
            let qry = bankRecordsQry.query;
            var isSuccess = await this.isJobSuccessful(qry,connection,awsManager);
            if(!isSuccess){
                await this.publishToMonitoring('finzly','BANK DATA','BIC/IBAN',`${stage}/BANK record count is less than the threshold`,queueUrl,SQS);
            }
            const holidayRecordsQry = queries.find(query => query.query_name === 'holiday');                
            qry = holidayRecordsQry.query;
            //qry = `SELECT count(*) as count FROM galaxy_staticdata_finzly.holiday`;
            var isSuccess = await this.isJobSuccessful(qry,connection,awsManager);
            if(!isSuccess){
                await this.publishToMonitoring('finzly','Holiday Calendar','Holidays',`${stage}/Holiday record count is less than the threshold`,queueUrl,SQS);
            }
            const ibanPlusQry = queries.find(query => query.query_name === 'iban_plus');                
            qry = ibanPlusQry.query;
            //qry = `SELECT count(*) as count FROM galaxy_staticdata_finzly.iban_plus`;
            var isSuccess = await this.isJobSuccessful(qry,connection,awsManager);
            if(!isSuccess){
                await this.publishToMonitoring('finzly','IBAN DATA','BIC/IBAN',`${stage}/IBAN record count is less than the threshold`,queueUrl,SQS);
            }

            const ibanStrQry = queries.find(query => query.query_name === 'iban_structure');                
            qry = ibanStrQry.query;
            //qry = `SELECT count(*) as count FROM galaxy_staticdata_finzly.iban_structure`
            var isSuccess = await this.isJobSuccessful(qry,connection,awsManager);
            if(!isSuccess){
                await this.publishToMonitoring('finzly','IBAN STRUCTURE DATA','BIC/IBAN',`${stage}/IBAN_STRUCTURE record count is less than the threshold`,queueUrl,SQS);
            }
            const routingNumberQry = queries.find(query => query.query_name === 'routing_numbers');                
            qry = routingNumberQry.query;
            //qry = `SELECT count(*) FROM galaxy_staticdata_finzly.routing_numbers`;
            var isSuccess = await this.isJobSuccessful(qry,connection,awsManager);
            if(!isSuccess){
                await this.publishToMonitoring('finzly','Routing Numbers','ACH/RTN',`${stage}/ACH Routing number record count is less than the threshold`,queueUrl,SQS);
            }
        }catch(ex){
            console.log(ex);
        }finally{
            if (connection && connection.end) {
                connection.end();
            }
        }
    }
    async isJobSuccessful(qry,connection,awsManager) {
        try{
            const results = await helper.query(qry,connection);
            console.log(JSON.stringify(results));
            if(results && results.length > 0){
                if(results[0].count > 0){
                    return true;
                }else{
                    return false;
                }
                // if(results[0].count < count_threshold){
                //     return false;
                // }else{
                //     return true;
                // }
            }else{
                return false;
            }
        }catch(ex){
            console.log(`Failed to execute query: ${qry}`);
            console.log(ex);
            return false;
        }
    }
    async publishToMonitoring(tenant_name,event_name,source_system,description,queueUrl,SQS) {
        try{
            const event_id = await helper.createEventId(tenant_name,event_name); 
            let obj = {
                event_id:event_id,
                event_type: 'JOB_EXECUTION_FAILURE',
                source_system: source_system,
                tenant_name: tenant_name,
                details: JSON.stringify({Tenant:'finzly'}),
                description:description
            };
            if (queueUrl) {
                const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                this.log.info("Notification send successfully :: ", obj)
            }
        }catch(ex){
            console.log(ex);
        }
    }


    async process(event, context, callback) {
        const awsManager = new awsmanager();
        let error_desc = null;
        var monitoring_db_conn  = null;
        try{
            this.log.info(event);
            let message = "Process completed."
            let SQS = new AWS.SQS({region:REGION});
            const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
            const monitoring_db_conn = await helper.create_connection_with_monitoring_db(STAGE, awsManager);
            if (!monitoring_db_conn) {
                error_desc = 'Unable to connect to monitoring  database';
                this.log.error(error_desc);
                throw new Error(`Process failed: ${error_desc}`);
            }
            let condition =`lambda_name = '${ ENUM.queries_identifier.STATICDATA_MONITOR }';`
            let queries = await helper.fetch_queries(condition,monitoring_db_conn)
            console.log(`#### Queries: ${JSON.stringify(queries)}`);

            var stage_1 = null;
            var stage_2 = null;
            if('prod' == STAGE.toLowerCase()){
                stage_1= "prod";
                stage_2="prod2";
            }else if('dr' == STAGE.toLowerCase()){
                stage_1= "dr";
                stage_2="dr2";
            }
            await this.check_job_execution(stage_1,awsManager,queries,queueUrl,SQS);
            await this.check_job_execution(stage_2,awsManager,queries,queueUrl,SQS);
            /*
            const tenant_name = 'finzly';
            const connection = await helper.create_connection_with_tenant_db(STAGE, tenant_name, awsManager);
            if (!connection) {
                error_desc = `Not able to read the ${tenant_name} database server properties from parameter store`;
                throw new Error(`Process failed: ${error_desc}`);
            }
            const bankRecordsQry = queries.find(query => query.query_name === 'bank');                
            let qry = bankRecordsQry.query;
            var isSuccess = await this.isJobSuccessful(qry,connection,awsManager);
            if(!isSuccess){
                await this.publishToMonitoring('finzly','BANK DATA','BIC/IBAN',`BANK record count is less than the threshold`,queueUrl,SQS);
            }
            const holidayRecordsQry = queries.find(query => query.query_name === 'holiday');                
            qry = holidayRecordsQry.query;
            //qry = `SELECT count(*) as count FROM galaxy_staticdata_finzly.holiday`;
            var isSuccess = await this.isJobSuccessful(qry,connection,awsManager);
            if(!isSuccess){
                await this.publishToMonitoring('finzly','Holiday Calendar','Holidays',`Holiday record count is less than the threshold`,queueUrl,SQS);
            }
            const ibanPlusQry = queries.find(query => query.query_name === 'iban_plus');                
            qry = ibanPlusQry.query;
            //qry = `SELECT count(*) as count FROM galaxy_staticdata_finzly.iban_plus`;
            var isSuccess = await this.isJobSuccessful(qry,connection,awsManager);
            if(!isSuccess){
                await this.publishToMonitoring('finzly','IBAN DATA','BIC/IBAN',`IBAN record count is less than the threshold`,queueUrl,SQS);
            }

            const ibanStrQry = queries.find(query => query.query_name === 'iban_structure');                
            qry = ibanStrQry.query;
            //qry = `SELECT count(*) as count FROM galaxy_staticdata_finzly.iban_structure`
            var isSuccess = await this.isJobSuccessful(qry,connection,awsManager);
            if(!isSuccess){
                await this.publishToMonitoring('finzly','IBAN STRUCTURE DATA','BIC/IBAN',`IBAN_STRUCTURE record count is less than the threshold`,queueUrl,SQS);
            }
            const routingNumberQry = queries.find(query => query.query_name === 'routing_numbers');                
            qry = routingNumberQry.query;
            //qry = `SELECT count(*) FROM galaxy_staticdata_finzly.routing_numbers`;
            var isSuccess = await this.isJobSuccessful(qry,connection,awsManager);
            if(!isSuccess){
                await this.publishToMonitoring('finzly','Routing Numbers','ACH/RTN',`ACH Routing number record count is less than the threshold`,queueUrl,SQS);
            }
            */
            //TODO
            /*await helper.register_heartbeat(
                `${MONITORING_SERVICE_URL}/heartbeat`,
                API_KEY,
                awsManager,
                'JOB_EXECUTION_FAILURE',
                `${tenant_name}`,
                `Azkaban Job execution monitor.`
            );*/
        } catch (err) {
            this.log.error(`Internal Server Error: `, err);
            await helper.notify_failure(awsManager,"staticdata_load_monitor",err.message);
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
    return await new StaticDataLoadMonitor().handler(event, context, callback);
};