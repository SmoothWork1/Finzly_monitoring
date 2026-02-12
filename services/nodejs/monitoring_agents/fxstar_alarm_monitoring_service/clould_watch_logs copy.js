const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
var zlib = require('zlib');
const { MONITORING_QUEUE_NAME,CROSSACCOUNT_ID,CROSSACCOUNT_ROLE,STAGE } = process.env;
const helper = require('./helper.js');
const AWS = require("aws-sdk");
//AWS.config.update({ region: 'us-east-2' })
const ACM = new AWS.ACM({ apiVersion: '2015-12-08' })

class cloudWatchLog extends BaseHandler {
    constructor() {
        super();
    }
    async process(event, context, callback) {
        try {
            if (event.awslogs && event.awslogs.data) {
                console.log(event.awslogs);
                const awsManager = new awsmanager();
                const roleArn = `arn:aws:iam::${CROSSACCOUNT_ID}:role/${CROSSACCOUNT_ROLE}`;
                const assumedRole = await awsManager.assumeRole(roleArn);
                const accessparams = {
                    region:'us-east-2',
                    accessKeyId: assumedRole.Credentials.AccessKeyId,
                    secretAccessKey: assumedRole.Credentials.SecretAccessKey,
                    sessionToken: assumedRole.Credentials.SessionToken,
                };
                let SQS = new AWS.SQS(accessparams);
                const log = this.getReadableLogs(event.awslogs.data);
                const queueUrl = await helper.getQueueUrl(MONITORING_QUEUE_NAME, SQS);
                let message = null;
                let event_time = null;
                for(const log_event of log.logEvents){
                    if(log_event.message.indexOf('INFO') !== -1){
                        continue;
                    }
                    if(!event_time){
                        event_time = new Date(log_event.timestamp).toString();
                    }
                    message = message?`${message}${log_event.message}</br>`:`${log_event.message}</br>`
                }
                if(message){
                    message = `<span>Source System:${log.logGroup}</br>${message}</span>`;
                    const obj = {
                        event_id:`${Date.now()}`,
                        event_type: 'RUNTIME_EXCEPTIONS',
                        source_system: `${log.logGroup}`,
                        tenant_name: 'finzly',
                        details: JSON.stringify({"Time":event_time}),
                        description:message
                    };
                    if (queueUrl) {
                        const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                        this.log.info("Notification send successfully :: ", obj)
                    }else {
                        console.log(`Failed to get sqs queue url for: ${MONITORING_QUEUE_NAME}`)
                    }
                }
            }
        } catch (err) {
            this.log.info("Exception in logCHECK function :", err)
        }
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