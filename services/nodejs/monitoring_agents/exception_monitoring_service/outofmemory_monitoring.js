const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
var zlib = require('zlib');
const { MONITORING_SERVICE_URL,API_KEY,PLATFORM,STAGE,REGION } = process.env;
const helper = require('./helper.js');
const AWS = require("aws-sdk");
AWS.config.update({region: REGION});
const CWL = new AWS.CloudWatchLogs({apiVersion: '2014-03-28'});

class cloudWatchLog extends BaseHandler {
    constructor() {
        super();
    }
    async process(event, context, callback) {
        try {
            console.log(event);
            if (event.awslogs && event.awslogs.data) {
                const awsManager = new awsmanager();
                const log = this.getReadableLogs(event.awslogs.data);
                console.log(log);
                const tenant_name = STAGE.toUpperCase();
                const log_group = log.logGroup;
                const source_system = log.logStream;
                let message = null;
                let event_time = null;
                /*const filter_pattern = await this.getsubscriptionFilter(log_group);
                if(!filter_pattern){
                    console.log('## No filter pattern ##');
                    return;
                }*/
                //SKIP sys-log events because those events would come in app specific logs
                //if(log_group.indexOf('sys')){
                //    return;
                //}
                for(const log_event of log.logEvents){
                    /*if(log_event.message.indexOf('INFO') !== -1){
                        continue;
                    }*/
                    if(!event_time){
                        event_time = new Date(log_event.timestamp).toString();
                    }
                    message = message?`${message}${log_event.message}</br>`:`${log_event.message}</br>`
                }
                const body = {
                    platform:PLATFORM,
                    application:`${source_system}`,
                    tenant:tenant_name,
                    description:message,
                    date:Date.now()
                  }
                  console.log(`BODY:${JSON.stringify(body)}`);
                  await helper.notify_monitoring_service(`${MONITORING_SERVICE_URL}/health`,API_KEY,awsManager,body);
                  console.log('## Notification has been sent to monitoring App ##');
            }
        } catch (err) {
            this.log.info("Exception in logCHECK function :", err)
        }
    }
    async getsubscriptionFilter(logGroupName) {
        var params = {
            logGroupName: logGroupName,
            limit: 5
        };
        const data = await CWL.describeSubscriptionFilters(params).promise();
        console.log(JSON.stringify(data));
        if(data && data.subscriptionFilters){
            return data.subscriptionFilters[0].filterPattern;
        }
        return null;
    }
    getReadableLogs(encodedLogs) {
        const decodedLog = Buffer.from(encodedLogs, 'base64');
        const parsed = JSON.parse(zlib.gunzipSync(decodedLog).toString('utf8'));
        console.log("parsed  : parsed ", parsed)
        return parsed;
    }
    truncate(str, n){
        return (str.length > n) ? str.slice(0, n-1) + '&hellip;' : str;
    }
}

exports.logcheck = async (event, context, callback) => {
    return await new cloudWatchLog().handler(event, context, callback);
};