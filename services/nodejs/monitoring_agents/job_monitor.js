const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const AWS = require("aws-sdk");
const helper = require('./helper.js');
const responseHelper = require('/opt/modules/common/response');
const { STAGE,MONITORING_SQS_NAME,MONITORING_SERVICE_URL,API_KEY,REGION} = process.env;
const MIN_15_INTERVAL = 15;
const DAY_LIGHT_SAVINGS_UTC_TO_EST_HRS = 4; 
class JobMonitor extends BaseHandler {
    constructor() {
        super();
    }
    async isJobSuccessful(tenant_name,connection,job_id,hours,minutes,awsManager,flow_id) {
        let qry = `SELECT * FROM scheduler_${tenant_name}.execution_jobs WHERE job_id='${job_id}' and DATE(CONVERT_TZ(FROM_UNIXTIME(start_time/1000),'UTC', 'UTC')) = (date(now())) AND HOUR(CONVERT_TZ(FROM_UNIXTIME(start_time/1000),'UTC', 'UTC')) IN (${hours}) AND MINUTE(CONVERT_TZ(FROM_UNIXTIME(start_time/1000),'UTC', 'UTC')) in (${minutes})`;
        if(flow_id){
            qry = `SELECT * FROM scheduler_${tenant_name}.execution_jobs WHERE job_id='${job_id}' and flow_id='${flow_id}' and DATE(CONVERT_TZ(FROM_UNIXTIME(start_time/1000),'UTC', 'UTC')) = (date(now())) AND HOUR(CONVERT_TZ(FROM_UNIXTIME(start_time/1000),'UTC', 'UTC')) IN (${hours}) AND MINUTE(CONVERT_TZ(FROM_UNIXTIME(start_time/1000),'UTC', 'UTC')) in (${minutes})`;
        }
        console.log(`Qry: ${qry}`);
        const results = await helper.query(qry,connection);
        if(results && results.length > 0){
            console.log(`--- Result Status:${results[0].status}`);
            results[0].status;
            if('50' ==  results[0].status){
                return true;
            }else{
                return false;
            }
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
    async findNearestSmaller (inputNumber, array) {
        let nearest = null;
    
        for (let i = 0; i < array.length; i++) {
            if (array[i] < inputNumber && (nearest === null || inputNumber - array[i] < inputNumber - nearest)) {
                nearest = array[i];
            }
        }
    
        return nearest;
    }
    async process(event, context, callback) {
        const awsManager = new awsmanager();
        let errors =[];
        try{
            this.log.info(event);
            let message = "Process completed."
            let SQS = new AWS.SQS({region:REGION});
            const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
            //const tenants = await helper.fetchActiveTenants(STAGE,awsManager);
            const all_tenants = await helper.fetchActiveTenants(STAGE,awsManager);
            for(const obj of all_tenants){
                const stg = obj.stage;
                for(const tenant_name of obj.tenants) {
                    var connection = null;
                    try{
                        console.log(`#-------- Tenant: ${tenant_name} ---------------#`);
                        connection = await helper.create_connection_with_tenant_db(stg, tenant_name, awsManager);
                        if (!connection) {
                            throw new Error(`Process failed: Not able to read the ${tenant_name} database server properties from parameter store`);    
                        }
                        const key = `/config/bankos/global_prod/bankos.monitoring.tenant.${tenant_name}.jobs`;
                        const config = await helper.getConfigPropertiesByKeys([key],stg,awsManager);
                        if(!config){
                            errors.push(`Faild to fetch property ${key}`);
                            continue;
                        }
                        let confg_obj = null;
                        try{
                            confg_obj = config[key];
                        }catch(ex){
                            console.log(ex);
                            errors.push(`Faild to fetch property ${key}`);
                            continue;
                        }
                        
                        var job_config = null;
                        if(confg_obj){
                            console.log(typeof confg_obj);
                            if(typeof confg_obj === 'string'){
                                console.log(confg_obj);
                                job_config = JSON.parse(confg_obj);
                            }
                        }
                        console.log(job_config);
                        const date = new Date();
                        const hr_min = date.toLocaleTimeString('en-US', {
                            timeZone: 'America/New_York',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        })
                        //console.log(`Date EST:${date_est}`);
                        const currentHour = date.getUTCHours();
                        const currentMinute = date.getUTCMinutes();
                        //const job_hr_utc = date.getUTCHours();
                        //const job_min = ((date.getUTCMinutes()-MIN_15_INTERVAL)-(date.getUTCMinutes()-MIN_15_INTERVAL)%MIN_15_INTERVAL);
                        console.log(`Current UTC Hour:${currentHour}, Current UTC Minute:${currentMinute}`);
                        console.log(`Current EST Hour:${date.getHours()}, Current EST Minute:${date.getMinutes()}`);
        
                        //console.log(`Job Hour:${job_hr_utc}, Job Minute:${job_min}`);
                        //35-15 = 20
                        for(const job of job_config){
                            const hours = job.hours.split(",");
                            var hr_ary = hours.map(Number);
                            const mins = job.minutes.split(",");
                            var min_ary = mins.map(Number);
        
                            //const time_obj = await this.get_current_hr_and_min_est();
                            //var curr_hr_est = time_obj.hour;
                            //var curr_min_est = time_obj.minute < 3 ? 0 :(time_obj.minute-job.interval);
                            //const closest_job_min = await this.closest_num(curr_min_est, min_ary);
                            var curr_hr_est = currentHour;
                            var curr_min_est = currentMinute;
                            //var curr_min_est = currentMinute < 3 ? 0 :(currentMinute-job.interval);
                            const closest_job_min = await this.findNearestSmaller(curr_min_est, min_ary);
                            if(closest_job_min == null){
                                continue;
                            }
                            let offset_hr = 0;
                            if(curr_min_est < closest_job_min){
                                if(curr_min_est == 0){
                                    if(curr_hr_est == 0){
                                        curr_hr_est = 23;
                                    }else{
                                        curr_hr_est = curr_hr_est - 1;
                                        offset_hr = 1;
                                    }
                                }else{
                                    console.log(`Current minute:${curr_min_est} is lessthan closest job min ${closest_job_min} hence continuing`)
                                    continue;
                                }
                            }
                            //var job_min_utc = ((date.getUTCMinutes()-job.interval)-(date.getUTCMinutes()-job.interval)%job.interval);
                            //curr_min_est = (curr_min_est < 10 ? '0' : '') + curr_min_est;
                            console.log(`Hours: ${hr_ary}`);
                            console.log(`Mins:${min_ary}`);
                            console.log(`Tenant: ${tenant_name} Job:${job.job_id}, Job Hour:${curr_hr_est}, Job Minute:${closest_job_min}, EST:${await this.get_date_est(offset_hr,job.interval)}`);
                            if(hr_ary.includes(curr_hr_est) && min_ary.includes(closest_job_min)){
                                const hr = (curr_hr_est < 10 ? '0' : '') + curr_hr_est;
                                const min = (closest_job_min < 10 ? '0' : '') + closest_job_min;
                                const successful = await this.isJobSuccessful(tenant_name,connection,job.job_id,curr_hr_est,closest_job_min,awsManager,job.flow_id);
                                if(!successful){
                                    const event_name = `${job.flow_id}-${job.job_id}-${curr_hr_est}-${closest_job_min}`;
                                    const event_id = await helper.createEventId(tenant_name,event_name); 
                                    let obj = {
                                        event_id:event_id,
                                        event_type: 'JOB_EXECUTION_FAILURE',
                                        source_system: job.job_id,
                                        tenant_name: tenant_name,
                                        details: JSON.stringify({Tenant:tenant_name,ExecutionTime:`${await this.get_date_est(offset_hr,job.interval)}`}),
                                        description:`Job not executed at ${await this.get_date_est(offset_hr,job.interval)}`
                                    };
                                    if (queueUrl) {
                                        const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                        this.log.info("Notification send successfully :: ", obj)
                                    }
                                }else{
                                    console.log(`Job:${job.job_id}/${tenant_name} is successfully executed at ${curr_hr_est}:${closest_job_min} EST`)
                                }
                            }else{
                                console.log(`JOB: ${job.job_id} is not configured to run at Hr:${curr_hr_est}:${closest_job_min}`);
                            }
                        }
                        await helper.register_heartbeat(
                            `${MONITORING_SERVICE_URL}/heartbeat`,
                            API_KEY,
                            awsManager,
                            'JOB_EXECUTION_FAILURE',
                            `${tenant_name}`,
                            `Azkaban Job execution monitor.`
                        );
                    }catch(ex){
                        this.log.error(`Failed execute queries for tenant: ${tenant_name}: `, ex);
                        await helper.notify_failure(awsManager,"Job-Monitor",ex.message);
                    }finally{
                        if (connection && connection.end) {
                            connection.end();
                        }
                    }
                }
            }
            if(errors.length > 0){
                console.log('### Errors found');
                throw new Error(errors.join(','));    
            }
        } catch (err) {
            this.log.error(`Internal Server Error: `, err);
            await helper.notify_failure(awsManager,"job_monitor",err.message);
            return responseHelper.sendServerErrorResponse({
                message: err.message
            })
        }
    }
}
exports.scheduler = async (event, context, callback) => {
    return await new JobMonitor().handler(event, context, callback);
};