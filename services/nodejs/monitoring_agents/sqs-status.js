const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const AWS = require("aws-sdk");
const helper = require('./helper.js');
const responseHelper = require('/opt/modules/common/response');
const { STAGE,MONITORING_SQS_NAME,REGION} = process.env;
const MONITORING_SERVICE_URL = process.env.MONITORING_SERVICE_URL;
const API_KEY = process.env.API_KEY;
const fiveMinutesInMillis = 5 * 60 * 1000;
class SQSStatus extends BaseHandler {
    constructor() {
        super();
    }
    async process(event, context, callback) {
        const awsManager = new awsmanager();
        var monitoring_db_conn = null;
        try{
            let SQS = new AWS.SQS({region:REGION});
            monitoring_db_conn = await helper.create_connection_with_monitoring_db(STAGE, awsManager);
            if (!monitoring_db_conn) {
                error_desc = 'Unable to connect to monitoring  database';
                this.log.error(error_desc);
                throw new Error(`Process failed: ${error_desc}`);

            }
            const cloudwatch = new AWS.CloudWatch({region:REGION});
            const data = await SQS.listQueues().promise();
            const results = [];
            for(const queueUrl of data.QueueUrls){
                try{
                    const params = {
                        MetricName: 'ApproximateAgeOfOldestMessage',
                        Namespace: 'AWS/SQS',
                        Dimensions: [
                          {
                            Name: 'QueueName',
                            Value: queueUrl.split('/').pop() // Extract the queue name from the URL
                          }
                        ],
                        StartTime: new Date(Date.now() - fiveMinutesInMillis), // Check for metrics in the last 5 minutes
                        EndTime: new Date(),
                        Period: 60, // 1-minute granularity
                        Statistics: ['Maximum']
                    };
                    // Fetch the ApproximateAgeOfOldestMessage metric
                    const result = await cloudwatch.getMetricStatistics(params).promise();
                    if (result.Datapoints.length > 0) {
                        const maxAge = result.Datapoints[0].Maximum; // Get the max age of the oldest message
                        if (maxAge > 300) { // If the message is older than 5 minutes
                            const dt = await SQS.getQueueAttributes({QueueUrl: queueUrl,AttributeNames: ['All']}).promise();
                            const messagesAvailable = dt.Attributes.ApproximateNumberOfMessages;
                            results.push({
                                Tenant:'finzly',
                                Name: queueUrl.split('/').pop(),
                                Description:'There are messages older than 5 minutes in the queue',
                                Total:messagesAvailable
                            });
                        }
                    }
                }catch(ex){
                    console.log(ex);
                }
                try{
                    // Now, check for messages in flight
                    const paramsInFlight = {
                        MetricName: 'ApproximateNumberOfMessagesInFlight',
                        Namespace: 'AWS/SQS',
                        Dimensions: [
                        {
                            Name: 'QueueName',
                            Value: queueUrl.split('/').pop()
                        }
                        ],
                        StartTime: new Date(Date.now() - fiveMinutesInMillis),
                        EndTime: new Date(),
                        Period: 60,
                        Statistics: ['Sum']
                    };
                    const resultInFlight = await cloudwatch.getMetricStatistics(paramsInFlight).promise();
                    if (resultInFlight.Datapoints.length > 0) {
                        const messagesInFlight = resultInFlight.Datapoints[0].Sum; // Total number of messages in flight
                        if (messagesInFlight > 0) {
                            results.push({
                                Tenant:'finzly',
                                Name: queueUrl.split('/').pop(),
                                Description:'There are messages in flight for more than 5 minutes',
                                Total:messagesInFlight
                            });
                        }
                    }
                }catch(ex){
                    console.log(ex);
                }
            }
            /////////////////////////////

            if(results.length > 0){
                const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                for(const result of results){
                    const event_id = await helper.createEventId(result.Tenant,result.Name);
                    let obj = {
                        event_id:event_id,
                        event_type: 'MQ_HEALTH',
                        source_system: `BankOS`,
                        tenant_name: result.Tenant,
                        details: JSON.stringify(result),
                        description:`${result.Total} Messages are stuck in the queue`
                    };
                    if (queueUrl) {
                        const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                        this.log.info("Notification send successfully :: ", obj)
                    }
                }
            }
            
            await helper.register_heartbeat(
                `${MONITORING_SERVICE_URL}/heartbeat`,
                API_KEY,
                awsManager,
                'MQ_HEALTH',
                'BankOS',
                `SQS/MQ Status Check`
            );
        } catch (err) {
            this.log.error(`Internal Server Error: `, err);
            await helper.notify_failure(awsManager,"mq-status-check",err.message);
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
    return await new SQSStatus().handler(event, context, callback);
};