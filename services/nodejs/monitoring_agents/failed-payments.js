const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const AWS = require("aws-sdk");
const helper = require('./helper.js');
const responseHelper = require('/opt/modules/common/response');
const { STAGE,MONITORING_SQS_NAME,TIME_LAPSE,FAILED_PAYMENT_STATUS_LIST,FAILED_ACH_TRANSACTION_STATUS_LIST,FAILED_FEDWIRE_TRANSACTION_STATUS_LIST,REGION} = process.env;
const MONITORING_SERVICE_URL = process.env.MONITORING_SERVICE_URL;
const API_KEY = process.env.API_KEY;
const ENUM = require('./enum.js')
const SQLHelper = require('/opt/modules/common/mysql_helper');
class FailedPayments extends BaseHandler {
    constructor() {
        super();
    }
    async failed_fees(tenant_name, connection, qry, awsManager) {
        //payments - COMPLIANCE_REQUEST_FAILURE,TRANSMISSION_FAILED
        //ach - 'FAILED','CREATE_PAYMENT_FAILED'
        //fedwire - 'INVALID','UNSUPPORTED','COPY','ERROR'
        //qry = `select group_concat(transaction_ref) as paymentIds,memo_post_status as status, count(*) as count from galaxy_fee_%%TENANT_NAME%%.fee where posting_date >= DATE(now()) and  memo_post_status = 'FAILURE' and TIME_TO_SEC(timediff(now(),last_updated_time)) > 600`;
        //const statusAry = FAILED_PAYMENT_STATUS_LIST.split(',')
        //const status = `'${statusAry.join("','")}'`;
        qry = qry.replace(/%%TENANT_NAME%%/g, tenant_name);
                //.replace(/%%STATUS%%/g, status)
                //.replace(/%%TIME_LAPSE%%/g, TIME_LAPSE);
        //const results = await awsManager.executeQuery(qry, connection);
        const results = await helper.query(qry,connection);
        const records = []
        if(results){
            for(const result of results){
                if(result.count <= 0){
                    continue;
                }
                records.push({
                    "Tenant":tenant_name,
                    "Status":result.status,
                    "Count":result.count,
                    "TransactionRef":result.paymentIds
                });
            }
        }
        return records;
    }
    async failed_payments(tenant_name, connection, qry, awsManager) {
        //payments - COMPLIANCE_REQUEST_FAILURE,TRANSMISSION_FAILED
        //ach - 'FAILED','CREATE_PAYMENT_FAILED'
        //fedwire - 'INVALID','UNSUPPORTED','COPY','ERROR'
        const statusAry = FAILED_PAYMENT_STATUS_LIST.split(',')
        const status = `'${statusAry.join("','")}'`;
        qry = qry.replace(/%%TENANT_NAME%%/g, tenant_name)
                .replace(/%%STATUS%%/g, status)
                .replace(/%%TIME_LAPSE%%/g, TIME_LAPSE);
        //const results = await awsManager.executeQuery(qry, connection);
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
        }
        return records;
    }
    async failed_ach(tenant_name, connection, qry, awsManager) {
        const statusAry = FAILED_ACH_TRANSACTION_STATUS_LIST.split(',')
        const status = `'${statusAry.join("','")}'`;
        qry = qry.replace(/%%TENANT_NAME%%/g, tenant_name)
                .replace(/%%STATUS%%/g, status)
                .replace(/%%TIME_LAPSE%%/g, TIME_LAPSE);
        //const results = await awsManager.executeQuery(qry,connection);
        const results = await helper.query(qry,connection);
        const records = []
        if(results) {
            for(const result of results){    
                //const paymentIds = this.fetch_ach_paymentIds(tenant_name,status,connection,result.immediate_origin_name);        
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
    async fetch_ach_paymentIds(tenant_name, status, qry, connection, customer, awsManager) {
        qry = qry.replace(/%%TENANT_NAME%%/g, tenant_name)
                .replace(/%%CUSTOMER%%/g, customer)
                .replace(/%%STATUS%%/g, status)
                .replace(/%%TIME_LAPSE%%/g, TIME_LAPSE);
        //const results = await awsManager.executeQuery(qry,connection);
        const results = await helper.query(qry,connection);
        let paymentIds = null;
        for(const result of results) {
            if(paymentIds){
                paymentIds = `${paymentIds},${result.payment_id}`;
            }else{
                paymentIds = `${result.payment_id}`;
            }
        }
        return paymentIds;
    }
    async failed_fedwire(tenant_name, connection, qry, awsManager) {
        const statusAry = FAILED_FEDWIRE_TRANSACTION_STATUS_LIST.split(',')
        const status = `'${statusAry.join("','")}'`;
        qry = qry.replace(/%%TENANT_NAME%%/g, tenant_name)
                .replace(/%%STATUS%%/g, status)
                .replace(/%%TIME_LAPSE%%/g, TIME_LAPSE);
        //const results = await awsManager.executeQuery(qry,connection);
        const results = await helper.query(qry,connection);
        const records = []
        if(results) {
            for(const result of results){    
                //const paymentIds = this.fetch_ach_paymentIds(tenant_name,status,connection,result.immediate_origin_name);        
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
    async duplicate_fedwire_payments(tenant_name, connection, qry, awsManager) {
        qry = qry.replace(/%%TENANT_NAME%%/g, tenant_name)
                .replace(/%%TIME_LAPSE%%/g, TIME_LAPSE);
        //const results = await awsManager.executeQuery(qry,connection);
        const results = await helper.query(qry,connection);
        const records = []
        if(results){
            for(const result of results){    
                //const paymentIds = this.fetch_ach_paymentIds(tenant_name,status,connection,result.immediate_origin_name);        
                records.push({
                    "Tenant":tenant_name,
                    "IMADs":result.imadIds,
                    "Count":result.count
                    //"PaymentID":paymentIds
                });
            }
        }
        return records;
    }
    async duplicate_fedwire_messages(tenant_name, connection, qry, awsManager) {
        qry = qry.replace(/%%TENANT_NAME%%/g, tenant_name)
                .replace(/%%TIME_LAPSE%%/g, TIME_LAPSE);
        //const results = await awsManager.executeQuery(qry,connection);
        const results = await helper.query(qry,connection);
        const records = []
        if(results){
            for(const result of results){    
                //const paymentIds = this.fetch_ach_paymentIds(tenant_name,status,connection,result.immediate_origin_name);        
                records.push({
                    "Tenant":tenant_name,
                    "IMADs":result.imadIds,
                    "Count":result.count,
                    "PaymentID":paymentIds
                });
            }
        }
        return records;
    }
    async duplicate_payments(tenant_name,connection,qry,awsManager) {
        qry = qry.replace(/%%TENANT_NAME%%/g, tenant_name)
                .replace(/%%TIME_LAPSE%%/g, TIME_LAPSE);

        const results = await helper.query(qry,connection);
        const records = []
        if(results){
            for(const result of results){    
                //const paymentIds = this.fetch_ach_paymentIds(tenant_name,status,connection,result.immediate_origin_name);        
                records.push({
                    "Tenant":tenant_name,
                    "Rail":result.delivery_method,
                    "Count":result.rec_count,
                    "NetworkRef":result.network_ref
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
            const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
            monitoring_db_conn = await helper.create_connection_with_monitoring_db(STAGE, awsManager);
            if (!monitoring_db_conn) {
                error_desc = 'Unable to connect to monitoring  database';
                this.log.error(error_desc);
                throw new Error(`Process failed: ${error_desc}`);
            }
            let condition =`lambda_name = '${ ENUM.queries_identifier.PAYMENT_FAILURE_LMDA }';`
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
                        const failFeesQuery = queries.find(query => query.query_name === ENUM.queries_identifier.FAILED_FEES);                   
                        const fee_results = await this.failed_fees(tenant_name, connection, failFeesQuery.query,  awsManager);
                        if(fee_results && fee_results.length > 0){
                            //const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                            for(const result of fee_results){
                                const event_id = await helper.createEventId(result.Tenant,result.PaymentIds);
                                let obj = {
                                    event_id:event_id,
                                    event_type: 'PAYMENT_FAILURE',
                                    source_system: `FEE`,
                                    tenant_name: tenant_name,
                                    details: JSON.stringify(result),
                                    description:`Fees found with failed memopost`
                                };
                                if (queueUrl) {
                                    const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                    this.log.info("Notification send successfully :: ", obj)
                                }
                            }
                        }

                        const failedPaymentsQuery = queries.find(query => query.query_name === ENUM.queries_identifier.FAILED_PAYMENTS);                   
                        const results = await this.failed_payments(tenant_name, connection, failedPaymentsQuery.query,  awsManager);
                        if(results){
                            //const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                            for(const result of results){
                                const event_id = await helper.createEventId(result.Tenant,result.PaymentIds);
                                let obj = {
                                    event_id:event_id,
                                    event_type: 'PAYMENT_FAILURE',
                                    source_system: `PAYMENT_GALAXY`,
                                    tenant_name: tenant_name,
                                    details: JSON.stringify(result),
                                    description:`Payments found with status - ${FAILED_PAYMENT_STATUS_LIST}`
                                };
                                if (queueUrl) {
                                    const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                    this.log.info("Notification send successfully :: ", obj)
                                }
                            }
                        }
                        const failedAchQuery = queries.find(query => query.query_name === ENUM.queries_identifier.FAILED_ACH);                   
                        const ach_results = await this.failed_ach(tenant_name, connection, failedAchQuery.query, awsManager);
                        if(ach_results){
                            //const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                            for(const result of ach_results){
                                const event_id = await helper.createEventId(result.Tenant,result.PaymentIds);
                                let obj = {
                                    event_id:event_id,
                                    event_type: 'PAYMENT_FAILURE',
                                    source_system: `ACH`,
                                    tenant_name: tenant_name,
                                    details: JSON.stringify(result),
                                    description:`ACH records found with status in - ${FAILED_ACH_TRANSACTION_STATUS_LIST}`
                                };
                                if (queueUrl) {
                                    const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                    this.log.info("Notification send successfully :: ", obj)
                                }
                            }
                        }
                        const failedFedWireQuery = queries.find(query => query.query_name === ENUM.queries_identifier.FAILED_FEDWIRE);                   
                        const fedwire_results = await this.failed_fedwire(tenant_name, connection, failedFedWireQuery.query, awsManager);
                        if(fedwire_results){
                            //const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                            for(const result of fedwire_results){
                                const event_id = await helper.createEventId(result.Tenant,result.PaymentIds);
                                let obj = {
                                    event_id:event_id,
                                    event_type: 'PAYMENT_FAILURE',
                                    source_system: `FEDWIRE`,
                                    tenant_name: tenant_name,
                                    details: JSON.stringify(result),
                                    description:`FEDWIRE records found with status in - ${FAILED_FEDWIRE_TRANSACTION_STATUS_LIST}`
                                };
                                if (queueUrl) {
                                    const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                    this.log.info("Notification send successfully :: ", obj)
                                }
                            }
                        }
                        const dupFedwirePaymentsQuery = queries.find(query => query.query_name === ENUM.queries_identifier.DUPLICATE_FEDWIRE_PAYMENTS);                   
                        const dup_fedwire_payments = await this.duplicate_fedwire_payments(tenant_name, connection, dupFedwirePaymentsQuery.query, awsManager);
                        if(dup_fedwire_payments){
                            //const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                            for(const result of dup_fedwire_payments){
                                const event_id = await helper.createEventId(result.Tenant,result.IMADs);
                                let obj = {
                                    event_id:event_id,
                                    event_type: 'PAYMENT_FAILURE',
                                    source_system: `FEDWIRE`,
                                    tenant_name: tenant_name,
                                    details: JSON.stringify(result),
                                    description:`Duplicate payments created for FEDWIRE message(s)`
                                };
                                if (queueUrl) {
                                    const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                    this.log.info("Notification send successfully :: ", obj)
                                }
                            }
                        }
                        const dupFedwireMsgQuery = queries.find(query => query.query_name === ENUM.queries_identifier.DUPLICATE_FEDWIRE_MSGS);                   
                        const dup_fedwire_messages = await this.duplicate_fedwire_messages(tenant_name, connection, dupFedwireMsgQuery.query, awsManager);
                        if(dup_fedwire_messages){
                            //const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                            for(const result of dup_fedwire_messages){
                                const event_id = await helper.createEventId(result.Tenant,result.PaymentID);
                                let obj = {
                                    event_id:event_id,
                                    event_type: 'PAYMENT_FAILURE',
                                    source_system: `FEDWIRE`,
                                    tenant_name: tenant_name,
                                    details: JSON.stringify(result),
                                    description:`Duplicate fedwires created for payments`
                                };
                                if (queueUrl) {
                                    const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                    this.log.info("Notification send successfully :: ", obj)
                                }
                            }
                        }
                        const dupPaymentsQuery = queries.find(query => query.query_name === ENUM.queries_identifier.DUPLICATE_PAYMENTS);                   
                        const dup_payments = await this.duplicate_payments(tenant_name, connection, dupPaymentsQuery.query, awsManager);
        
                        //const dup_payments = await this.duplicate_payments(tenant_name,connection,awsManager);
                        if(dup_payments){
                            //const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                            for(const result of dup_payments){
                                const event_id = await helper.createEventId(result.Tenant,result.NetworkRef);
                                let obj = {
                                    event_id:event_id,
                                    event_type: 'PAYMENT_FAILURE',
                                    source_system: result.Rail,
                                    tenant_name: tenant_name,
                                    details: JSON.stringify(result),
                                    description:`Duplicate payments created for ${result.Rail} - ${result.NetworkRef}`
                                };
                                if (queueUrl) {
                                    const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                    this.log.info("Notification send successfully :: ", obj)
                                }
                            }
                        }
                    }catch(ex){
                        this.log.error(`Failed execute queries for tenant: ${tenant_name}: `, ex);
                        await helper.notify_failure(awsManager,"failed-payments",ex.message);
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
                'PAYMENT_FAILURE',
                'BankOS',
                `Failed Payments - ACH, FEDWIRE, RTP etc`
            );
            //console.log(results);
        } catch (err) {
            this.log.error(`Internal Server Error: `, err);
            await helper.notify_failure(awsManager,"failed-payments",err.message);
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
    return await new FailedPayments().handler(event, context, callback);
};