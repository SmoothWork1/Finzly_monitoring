const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const AWS = require("aws-sdk");
const helper = require('./helper.js');
const ENUM = require('./enum.js');
const responseHelper = require('/opt/modules/common/response');
const { STAGE,MONITORING_SQS_NAME,REGION} = process.env;
const MIN_15_INTERVAL = 15;
const DAY_LIGHT_SAVINGS_UTC_TO_EST_HRS = 4; 
class SystemDateMonitor extends BaseHandler {
    constructor() {
        super();
    }
    async isAccountsSystemDateRoll(qry,tenant_name,connection,queueUrl,SQS) {
        //const qry = `SELECT DATE(NOW()) as 'CURRENT_DATE', value as 'NEXT_EOD_DATE' FROM galaxy_accounts_${tenant_name}.system_date WHERE id = 'NEXT_EOD_DATE' AND value <= DATE(NOW())`;
        try{
            const results = await helper.query(qry,connection);
            console.log(JSON.stringify(results))
            var isSuccess = true;
            if(results){
                if(results.length > 0){
                    isSuccess = false;
                }
            }else{
                isSuccess = false;
            }
            if(!isSuccess){
                const event_name = 'galaxy_accounts.system_date';
                const source_system = 'System Date Rollover';
                const event_id = await helper.createEventId(tenant_name,event_name);
                let obj = {
                    event_id:event_id,
                    event_type: 'JOB_EXECUTION_FAILURE',
                    //source_system: job.job_id,
                    source_system: source_system,
                    tenant_name: tenant_name,
                    details: JSON.stringify({Tenant:tenant_name,Application:'Accounting'}),
                    description:`System Date Rollover failed for tenant:${tenant_name}`
                };
                const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                this.log.info("Notification send successfully :: ", obj);
            }else{
                console.log(`galaxy_accounts.system_date date roll is successful`);
            }
            
        }catch(ex){
            console.log(ex);
        }
    }
    async isFeeSystemDateRoll(qry,tenant_name,connection,queueUrl,SQS) {
        //const qry = `SELECT DATE(NOW()) as 'CURRENT_DATE', value as 'NEXT_EOD_DATE' FROM galaxy_fee_${tenant_name}.system_date WHERE id = 'NEXT_EOD_DATE' AND value <= DATE(NOW())`;
        try{
            const results = await helper.query(qry,connection);
            console.log(`Fee Systemdate Results: ${results}`);
            var isSuccess = true;
            if(results){
                if(results.length > 0){
                    isSuccess = false;
                }
            }else{
                console.log(`###inside fee else block`);
                isSuccess = false;
            }
            if(!isSuccess){
                const event_name = 'galaxy_fee.system_date';
                const source_system = 'System Date Rollover';
                const event_id = await helper.createEventId(tenant_name,event_name);
                let obj = {
                    event_id:event_id,
                    event_type: 'JOB_EXECUTION_FAILURE',
                    //source_system: job.job_id,
                    source_system: source_system,
                    tenant_name: tenant_name,
                    details: JSON.stringify({Tenant:tenant_name,Application:'Fee'}),
                    description:`System Date Rollover failed for tenant:${tenant_name}`
                };
                const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                this.log.info("Notification send successfully :: ", obj);
            }else{
                console.log(`galaxy_fee.system_date date roll is successful`);
            }
        }catch(ex){
            console.log(ex);
        }
    }
    async isPaymentGalaxySystemDateRoll(qry,tenant_name,connection,queueUrl,SQS) {
        //const qry = `SELECT DATE(NOW()) as 'CURRENT_DATE', value as 'NEXT_EOD_DATE' FROM paymentgalaxy_${tenant_name}.system_date WHERE id = 'NEXT_EOD_DATE' AND value <= DATE(NOW())`;
        try{
            const results = await helper.query(qry,connection);

            var isSuccess = true;
            if(results){
                if(results.length > 0){
                    isSuccess = false;
                }
            }else{
                isSuccess = false;
            }
            if(!isSuccess){
                const event_name = 'paymentgalaxy.system_date';
                const source_system = 'System Date Rollover';
                const event_id = await helper.createEventId(tenant_name,event_name);
                let obj = {
                    event_id:event_id,
                    event_type: 'JOB_EXECUTION_FAILURE',
                    //source_system: job.job_id,
                    source_system: source_system,
                    tenant_name: tenant_name,
                    details: JSON.stringify({Tenant:tenant_name,Application:'Payment Galaxy'}),
                    description:`System Date Rollover failed for tenant:${tenant_name}`
                };
                const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                this.log.info("Notification send successfully :: ", obj);
            }else{
                console.log(`Paymentgalaxy.system_date date roll is successful`);
            }
            
        }catch(ex){
            console.log(ex);
        }
    }
    async get_date_est(offset_hr,offset_min){
        const date = new Date();
        const new_date = new Date(date.getTime() - (offset_hr*60*60*1000 + offset_min*60*1000));
        const est_dt_str = new_date.toLocaleString('en-US', {
            timeZone: 'America/New_York',
        });
        return est_dt_str;
    }
    async get_current_hr_and_min_est(){
        const date = new Date();
        const hr_min_str = date.toLocaleTimeString('en-US', {
            timeZone: 'America/New_York',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        const hr_min = hr_min_str.split(':');
        return ({hour:hr_min[0],minute:hr_min[1]});
    }
    async closest_num(x,num_ary) {
        //var num_ary = str_ary.map(Number);
        return num_ary.sort( (a, b) => Math.abs(x - a) - Math.abs(x - b) )[0];
    }
    async process(event, context, callback) {
        const awsManager = new awsmanager();
        let error_desc = null;
        var monitoring_db_conn = null;
        try{
            this.log.info(event);
            const exclusion_rule_ary = event.exclusion_rule;
            let message = "Process completed."
            monitoring_db_conn = await helper.create_connection_with_monitoring_db(STAGE, awsManager);
            if (!monitoring_db_conn) {
                error_desc = 'Unable to connect to monitoring  database';
                this.log.error(error_desc);
                throw new Error(`Process failed: ${error_desc}`);
            }
            let condition =`lambda_name = '${ ENUM.queries_identifier.SYSTEMDATE_MONITOR }';`
            let queries = await helper.fetch_queries(condition,monitoring_db_conn)
            console.log(`#### Queries: ${JSON.stringify(queries)}`);

            let SQS = new AWS.SQS({region:REGION});
            const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
            const tenants = await helper.fetchActiveTenants(STAGE,awsManager);
            for(const tenant_name of tenants){
                var connection = null;
                try{
                    connection = await helper.create_connection_with_tenant_db(STAGE, tenant_name, awsManager);
                    if (!connection) {
                        error_desc = `Not able to read the ${tenant_name} database server properties from parameter store`;
                        throw new Error(`Process failed: ${error_desc}`);
                    }
                    for(const rule of exclusion_rule_ary){
                        if('galaxy_accounts' == rule.app){
                            const tenants = rule.tenants.split(',');
                            if(tenants.indexOf(tenant_name) == -1){
                                const systemDateQry = queries.find(query => query.query_name ===  'accounting_systemdate_roll');
                                await this.isAccountsSystemDateRoll(systemDateQry.query,tenant_name,connection,queueUrl,SQS);
                            }
                        }else if('galaxy_fee' == rule.app){
                            const tenants = rule.tenants.split(',');
                            if(tenants.indexOf(tenant_name) == -1){
                                const systemDateQry = queries.find(query => query.query_name ===  'fee_systemdate_roll');
                                await this.isFeeSystemDateRoll(systemDateQry.query,tenant_name,connection,queueUrl,SQS);
                            }
                        }else if('paymentgalaxy' == rule.app){
                            const tenants = rule.tenants.split(',');
                            if(tenants.indexOf(tenant_name) == -1){
                                const systemDateQry = queries.find(query => query.query_name ===  'payment_systemdata_roll');
                                await this.isPaymentGalaxySystemDateRoll(systemDateQry.query,tenant_name,connection,queueUrl,SQS);
                            }
                        }
                    }
                    //TODO
                    /*await helper.register_heartbeat(
                        `${MONITORING_SERVICE_URL}/heartbeat`,
                        API_KEY,
                        awsManager,
                        'JOB_EXECUTION_FAILURE',
                        `${tenant_name}`,
                        `Azkaban Job execution monitor.`
                    );*/
                }catch(ex){
                    this.log.error(`Failed execute queries for tenant: ${tenant_name}: `, ex);
                    await helper.notify_failure(awsManager,"systemdate-monitor",ex.message);
                }finally{
                    if (connection && connection.end) {
                        connection.end();
                    }
                }
            }
        } catch (err) {
            this.log.error(`Internal Server Error: `, err);
            await helper.notify_failure(awsManager,"systemdate_monitor",err.message);
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
    return await new SystemDateMonitor().handler(event, context, callback);
};