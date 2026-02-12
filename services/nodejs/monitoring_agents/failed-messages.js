const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const AWS = require("aws-sdk");
const helper = require('./helper.js');
const ENUM = require('./enum.js')
const responseHelper = require('/opt/modules/common/response');
const { STAGE,MONITORING_SQS_NAME,TIME_LAPSE,FAILED_RTP_MESSAGE_STATUS_LIST,REGION} = process.env;
const MSG_INTERVAL = 960; //16 mins
const MONITORING_SERVICE_URL = process.env.MONITORING_SERVICE_URL;
const API_KEY = process.env.API_KEY;
const SQLHelper = require('/opt/modules/common/mysql_helper');

class FailedMessages extends BaseHandler {
    constructor() {
        super();
    }
    async append_records(results,records,tenant_name) {
        if(results){
            for(const result of results){    
                    records.push({
                    "Tenant":tenant_name,
                    "Status":result.status,
                    "Count":result.count,
                    "Ids":result.ids,
                    "Description":result.description
                });
            }
        }
    }
    async failed_ach_elements(tenant_name,connection,queries,awsManager) {
        try{
            const failedACHTransactionsQuery = queries.find(query => query.query_name ===  ENUM.queries_identifier.FAILED_ACH_TRANSACTIONS);
            const failedBulkfilesQuery = queries.find(query => query.query_name ===  ENUM.queries_identifier.FAILED_BULK_FILES);
            const failedACHFiles = queries.find(query => query.query_name ===  ENUM.queries_identifier.FAILED_ACH_FILES);
            const failedNOCRecordsQuery = queries.find(query => query.query_name ===  ENUM.queries_identifier.FAILED_NOC_RECORDS);
            const failedReturnRecordsQuery = queries.find(query => query.query_name ===  ENUM.queries_identifier.FAILED_RETURN_RECORDS);
            const failedACHBatchQuery = queries.find(query => query.query_name ===  ENUM.queries_identifier.FAILED_ACH_BATCH);
    
            let qry1 = failedACHTransactionsQuery.query;
            qry1 = qry1.replace(/%%TENANT_NAME%%/g, tenant_name)
                    .replace(/%%MSG_INTERVAL%%/g, MSG_INTERVAL);
    
            let qry2 = failedBulkfilesQuery.query;
            qry2 = qry2.replace(/%%TENANT_NAME%%/g, tenant_name)
                    .replace(/%%MSG_INTERVAL%%/g, MSG_INTERVAL);
    
            let qry3 = failedACHFiles.query;
            qry3 = qry3.replace(/%%TENANT_NAME%%/g, tenant_name)
                    .replace(/%%MSG_INTERVAL%%/g, MSG_INTERVAL); 
    
            let qry4 = failedNOCRecordsQuery.query;
            qry4 = qry4.replace(/%%TENANT_NAME%%/g, tenant_name)
                    .replace(/%%MSG_INTERVAL%%/g, MSG_INTERVAL);
    
            let qry5 = failedReturnRecordsQuery.query;
            qry5 = qry5.replace(/%%TENANT_NAME%%/g, tenant_name)
                    .replace(/%%MSG_INTERVAL%%/g, MSG_INTERVAL);
    
            let qry6 = failedACHBatchQuery.query;
            qry6 = qry6.replace(/%%TENANT_NAME%%/g, tenant_name)
                    .replace(/%%MSG_INTERVAL%%/g, MSG_INTERVAL);
    
            const records = [];
            let results = await helper.query(qry1,connection);
            await this.append_records(results,records,tenant_name);
            results = await helper.query(qry2,connection);
            await this.append_records(results,records,tenant_name);
            results = await helper.query(qry3,connection);
            await this.append_records(results,records,tenant_name);
            results = await helper.query(qry4,connection);
            await this.append_records(results,records,tenant_name);
            results = await helper.query(qry5,connection);
            await this.append_records(results,records,tenant_name);
            results = await helper.query(qry6,connection);
            await this.append_records(results,records,tenant_name);
            return records;
        }catch(ex){
            console.log(ex);
        }
        return null;

    }

    async failed_fedwire(tenant_name, qry, connection, awsManager) {
        qry = qry.replace(/%%TENANT_NAME%%/g, tenant_name)
                .replace(/%%MSG_INTERVAL%%/g, MSG_INTERVAL);
        //const results = await awsManager.execute_query(qry,connection);
        const results = await helper.query(qry,connection);
        const records = []
        if(results){
            for(const result of results){    
                    records.push({
                    "Tenant":tenant_name,
                    "Status":result.status,
                    "Count":result.count,
                    "PaymentIds":result.paymentIds
                    //"PaymentID":paymentIds
                });
            }
        }
        return records;
    }
    async failed_rtp(tenant_name, qry, connection,awsManager) {
        const statusAry = FAILED_RTP_MESSAGE_STATUS_LIST.split(',')
        const status = `'${statusAry.join("','")}'`;
        qry = qry.replace(/%%TENANT_NAME%%/g, tenant_name)
                .replace(/%%STATUS%%/g, status)
                .replace(/%%MSG_INTERVAL%%/g, MSG_INTERVAL);
        //const results = await awsManager.execute_query(qry,connection);
        const results = await helper.query(qry,connection);
        const records = []
        if(results){
            for(const result of results){    
                    records.push({
                    "Tenant":tenant_name,
                    "Status":result.status,
                    "Count":result.count,
                    "PaymentIds":result.paymentIds
                    //"PaymentID":paymentIds
                });
            }
        }
        return records;
    }
    async process(event, context, callback) {
        const awsManager = new awsmanager();
        let error_desc = null;
        var monitoring_db_conn = null;
        try{
            this.log.info(event);
            let message = "Process completed."
            let SQS = new AWS.SQS({region:REGION});
            
            monitoring_db_conn = await helper.create_connection_with_monitoring_db(STAGE, awsManager);
            if (!monitoring_db_conn) {
                error_desc = 'Unable to connect to monitoring  database';
                this.log.error(error_desc);
                throw new Error(`Process failed: ${error_desc}`);
            }
            let condition =`lambda_name = '${ ENUM.queries_identifier.FAILED_MESSAGES }';`
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
                        const failedFedWireQuery = queries.find(query => query.query_name === ENUM.queries_identifier.FAILED_FEDWIRE);                
                        const fedwire_results = await this.failed_fedwire(tenant_name, failedFedWireQuery.query, connection, awsManager);
                        if(fedwire_results) {
                            const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                            for(const result of fedwire_results){
                                const event_id = await helper.createEventId(result.Tenant,result.PaymentIds);
                                let obj = {
                                    event_id:event_id,
                                    event_type: 'MESSAGE_FAILURES',
                                    source_system: `FEDWIRE`,
                                    tenant_name: tenant_name,
                                    details: JSON.stringify(result),
                                    description:`Fedwire messages found with missing payments`
                                };
                                if (queueUrl) {
                                    const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                    this.log.info("Notification send successfully :: ", obj)
                                }
                            }
                        }
                        const failedRtpWireQuery = queries.find(query => query.query_name ===  ENUM.queries_identifier.FAILED_RTP);                    
                        const rtp_results = await this.failed_rtp(tenant_name, failedRtpWireQuery.query, connection,awsManager);
                        if(rtp_results) {
                            const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                            for(const result of rtp_results){
                                const event_id = await helper.createEventId(result.Tenant,result.PaymentIds);
                                let obj = {
                                    event_id:event_id,
                                    event_type: 'MESSAGE_FAILURES',
                                    source_system: `RTP`,
                                    tenant_name: tenant_name,
                                    details: JSON.stringify(result),
                                    description:`RTP messages found with status in - ${FAILED_RTP_MESSAGE_STATUS_LIST}`
                                };
                                if (queueUrl) {
                                    const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                    this.log.info("Notification send successfully :: ", obj)
                                }
                            }
                        }
                        const ach_results = await this.failed_ach_elements(tenant_name,connection,queries,awsManager);
                        if(ach_results){
                            const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                            for(const result of ach_results){
                                const event_id = await helper.createEventId(result.Tenant,result.Ids);
                                let obj = {
                                    event_id:event_id,
                                    event_type: 'MESSAGE_FAILURES',
                                    source_system: `ACH`,
                                    tenant_name: tenant_name,
                                    details: JSON.stringify(result),
                                    description: result.Description
                                };
                                if (queueUrl) {
                                    const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                    this.log.info("Notification send successfully :: ", obj)
                                }
                            }
                        }
                    }catch(ex){
                        this.log.error(`Failed execute queries for tenant: ${tenant_name}: `, ex);
                        await helper.notify_failure(awsManager,"failed-messages",ex.message);
                    }finally{
                        if (connection != null) {
                            connection.end();
                        }
                    }
                }
            }
            await helper.register_heartbeat(
                `${MONITORING_SERVICE_URL}/heartbeat`,
                API_KEY,
                awsManager,
                'MESSAGE_FAILURES',
                'BankOS',
                `Failed Messages - RTP,FEDNOW etc`
            );
            //console.log(results);
        } catch (err) {
            this.log.error(`Internal Server Error: `, err);
            await helper.notify_failure(awsManager,"failed-messages",err.message);
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
    return await new FailedMessages().handler(event, context, callback);
};