const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const responseHelper = require('/opt/modules/common/response');
const { SQS_URL,CROSSACCOUNT_ID,CROSSACCOUNT_ROLE,STAGE } = process.env;
const helper = require('./helper/helper.js');
const AWS = require("aws-sdk");
//AWS.config.update({ region: 'us-east-2' })
const ACM = new AWS.ACM({ apiVersion: '2015-12-08' })

class HeartBeat extends BaseHandler {
    constructor() {
        super();
    }
    async process(event, context, callback) {
        try {
            console.log(event.body);
            const request = JSON.parse(event.body);
            const date = new Date();
            const executedOn = date.toLocaleString('en-US', {
                timeZone: 'America/New_York',
            });
            const message_obj = {
                event_id:request.event_id,
                source_system: request.source_system,
                event_type: 'HEART_BEAT',
                tenant_name:'finzly',
                executed_on: request.executed_on,
                description: request.description
            };
            const awsManager = new awsmanager();
            console.log(`SQS_URL:${SQS_URL}`);
            await awsManager.sendExpirationSQSMessageJSON(message_obj, SQS_URL);
            return responseHelper.sendSuccessResponse({
                message: 'Process Complete'
            });
        } catch (err) {
            console.log(err);
        }
    }
}

exports.heartbeat = async (event, context, callback) => {
    return await new HeartBeat().handler(event, context, callback);
};