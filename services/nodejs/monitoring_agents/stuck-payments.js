const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const AWS = require("aws-sdk");
const helper = require('./helper.js');
const responseHelper = require('/opt/modules/common/response');
const { STAGE,MONITORING_SQS_NAME,TIME_LAPSE,STUCK_ACH_PAYMENT_STATUS_LIST,STUCK_FEDWIRE_PAYMENT_STATUS_LIST,STUCK_ACH_TRANSACTION_STATUS_LIST,STUCK_FEDWIRE_TRANSACTION_STATUS_LIST,REGION} = process.env;
const CHANNEL_ACH = "";
const CHANNEL_FEDWIRE = "";
const SQLHelper = require('/opt/modules/common/mysql_helper');
const ENUM = require('./enum.js')
const MONITORING_SERVICE_URL = process.env.MONITORING_SERVICE_URL;
const API_KEY = process.env.API_KEY;
class StuckPayments extends BaseHandler {
    constructor() {
        super();
    }
    async check_payments(tenant_name, channel, status_list, qry, connection, awsManager) {
        const statusAry = status_list.split(',')
        const status = `'${statusAry.join("','")}'`;
        qry = qry.replace(/%%TENANT_NAME%%/g, tenant_name)
                .replace(/%%STATUS%%/g, status)
                .replace(/%%TIME_LAPSE%%/g, TIME_LAPSE)
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
        }
        return records
    }
    async check_ach(tenant_name, qry, connection,awsManager) {
        const statusAry = STUCK_ACH_TRANSACTION_STATUS_LIST.split(',')
        const status = `'${statusAry.join("','")}'`;
        qry = qry.replace(/%%TENANT_NAME%%/g, tenant_name)
                .replace(/%%STATUS%%/g, status)
                .replace(/%%TIME_LAPSE%%/g, TIME_LAPSE)
        //const results = await awsManager.executeQuery(qry,connection);
        const results = await helper.query(qry,connection);
        const records = []
        if(results){
            for(const result of results){    
                //const paymentIds = this.fetch_ach_paymentIds(tenant_name,status,connection,result.immediate_origin_name);        
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
    async fetch_ach_paymentIds(tenant_name,status, qry, connection,customer, awsManager) {
        qry = qry.replace(/%%TENANT_NAME%%/g, tenant_name)
                .replace(/%%CUSTOMER%%/g, customer)
                .replace(/%%STATUS%%/g, status)
                .replace(/%%TIME_LAPSE%%/g, TIME_LAPSE)
        //const results = await awsManager.executeQuery(qry, connection);
        const results = await helper.query(qry,connection);
        let paymentIds = null;
        for(const result of results){
            if(paymentIds){
                paymentIds = `${paymentIds},${result.payment_id}`;
            }else{
                paymentIds = `${result.payment_id}`;
            }
        }
        return paymentIds;
    }
    async check_fedwire(tenant_name, qry, connection,awsManager) {
        const statusAry = STUCK_FEDWIRE_TRANSACTION_STATUS_LIST.split(',')
        const status = `'${statusAry.join("','")}'`;
        qry = qry.replace(/%%TENANT_NAME%%/g, tenant_name)
                .replace(/%%STATUS%%/g, status)
                .replace(/%%TIME_LAPSE%%/g, TIME_LAPSE)
        //const results = await awsManager.executeQuery(qry,connection);
        const results = await helper.query(qry,connection);
        const records = []
        if(results){
            for(const result of results){    
                //const paymentIds = this.fetch_ach_paymentIds(tenant_name,status,connection,result.immediate_origin_name);        
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
    async process(event, context, callback) {
        const awsManager = new awsmanager();
        var monitoring_db_conn = null;
        try{
            this.log.info(event);
            let error_desc = null;
            let message = "Process completed."
           // const tenant_name = event.tenant_name;
            //this.log.info(`Tenant Name:${tenant_name}`);
            
            /*
            const roleArn = `arn:aws:iam::${CROSSACCOUNT_ID}:role/${CROSSACCOUNT_ROLE}`;
            const assumedRole = await awsManager.assumeRole(roleArn);
            const accessparams = {
                region:'us-east-2',
                accessKeyId: assumedRole.Credentials.AccessKeyId,
                secretAccessKey: assumedRole.Credentials.SecretAccessKey,
                sessionToken: assumedRole.Credentials.SessionToken,
            };
            let SQS = new AWS.SQS(accessparams);
            */
            let SQS = new AWS.SQS({region:REGION});
            monitoring_db_conn = await helper.create_connection_with_monitoring_db(STAGE, awsManager);
            if (!monitoring_db_conn) {
                error_desc = 'Unable to connect to monitoring  database';
                this.log.error(error_desc);
                throw new Error(`Process failed: ${error_desc}`);

            }
            /*const finzlyDbConnection = await awsManager.createConnectionWithTenantDb(STAGE, "finzly", awsManager);
            if (!finzlyDbConnection) {
                this.log.error(`Not able to read the ${tenant_name} database server properties from parameter store`);
                message = "Process failed."
                return responseHelper.sendServerErrorResponse({
                    message: message
                })
            }*/
            let condition =`lambda_name = '${ ENUM.queries_identifier.STUCK_PAYMENTS }';`
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
                        //Check payments of ACH channel
                        connection = await helper.create_connection_with_tenant_db(stg, tenant_name, awsManager);
                        if (!connection) {
                            error_desc = `Not able to read the ${tenant_name} database server properties from parameter store`;
                            throw new Error(`Process failed: ${error_desc}`);
                        }
                        const checkPaymentQuery = queries.find(query => query.query_name === ENUM.queries_identifier.CHECK_PAYMENTS);                                   
                        var results = await this.check_payments(tenant_name,CHANNEL_ACH,STUCK_ACH_PAYMENT_STATUS_LIST, checkPaymentQuery.query, connection,awsManager);
                        if(results){
                            const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                            for(const result of results){
                                const event_id = await helper.createEventId(result.Tenant,result.PaymentIds);
                                let obj = {
                                    event_id:event_id,
                                    event_type: 'STUCK_PAYMENTS',
                                    source_system: `Payment`,
                                    tenant_name: tenant_name,
                                    details: JSON.stringify(result),
                                    description:`Payments are stuck in - ${STUCK_ACH_PAYMENT_STATUS_LIST}`
                                };
                                if (queueUrl) {
                                    const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                    this.log.info("Notification send successfully :: ", obj)
                                }
                            }
                        }
                        //Check payments of FEDWIRE channel
                        results = await this.check_payments(tenant_name,CHANNEL_FEDWIRE,STUCK_FEDWIRE_PAYMENT_STATUS_LIST, checkPaymentQuery.query, connection,awsManager);
                        if(results){
                            const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                            for(const result of results){
                                const event_id = await helper.createEventId(result.Tenant,result.PaymentIds);
                                let obj = {
                                    event_id:event_id,
                                    event_type: 'STUCK_PAYMENTS',
                                    source_system: `Payment`,
                                    tenant_name: tenant_name,
                                    details: JSON.stringify(result),
                                    description:`Payments are stuck in - ${STUCK_FEDWIRE_PAYMENT_STATUS_LIST}`
                                };
                                if (queueUrl) {
                                    const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                    this.log.info("Notification send successfully :: ", obj)
                                }
                            }
                        }
                        const checkAchQuery = queries.find(query => query.query_name === ENUM.queries_identifier.CHECK_ACH);                                   
                        const ach_results = await this.check_ach(tenant_name, checkAchQuery.query, connection,awsManager);
                        if(ach_results){
                            const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                            for(const result of ach_results){
                                const event_id = await helper.createEventId(result.Tenant,result.PaymentIds);
                                let obj = {
                                    event_id:event_id,
                                    event_type: 'STUCK_PAYMENTS',
                                    source_system: `ACH`,
                                    tenant_name: tenant_name,
                                    details: JSON.stringify(result),
                                    description:`ACH records are stuck in - ${STUCK_ACH_TRANSACTION_STATUS_LIST}`
                                };
                                if (queueUrl) {
                                    const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                    this.log.info("Notification send successfully :: ", obj)
                                }
                            }
                        }
                        const checkFedWireQuery = queries.find(query => query.query_name === ENUM.queries_identifier.CHECK_FEDWIRE);                                   
                        const fedwire_results = await this.check_fedwire(tenant_name, checkFedWireQuery.query, connection,awsManager);
                        if(fedwire_results){
                            const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                            for(const result of fedwire_results){
                                const event_id = await helper.createEventId(result.Tenant,result.PaymentIds);
                                let obj = {
                                    event_id:event_id,
                                    event_type: 'STUCK_PAYMENTS',
                                    source_system: `FEDWIRE`,
                                    tenant_name: tenant_name,
                                    details: JSON.stringify(result),
                                    description:`FEDWIRE records are stuck in - ${STUCK_FEDWIRE_TRANSACTION_STATUS_LIST}`
                                };
                                if (queueUrl) {
                                    const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                    this.log.info("Notification send successfully :: ", obj)
                                }
                            }
                        }
                        //console.log(results);
                    }catch(ex){
                        this.log.error(`Failed execute queries for tenant: ${tenant_name}: `, ex);
                        await helper.notify_failure(awsManager,"stuck-payments",ex.message);
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
                'STUCK_PAYMENTS',
                'BankOS',
                `Stuck Payments - ACH, FEDWIRE, RTP etc`
            );
        } catch (err) {
            this.log.error(`Internal Server Error: `, err);
            await helper.notify_failure(awsManager,"stuck-payments",err.message);
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
    return await new StuckPayments().handler(event, context, callback);
};