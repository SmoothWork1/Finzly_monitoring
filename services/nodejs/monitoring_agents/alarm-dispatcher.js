const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper.js');
const { MONITORING_SERVICE_URL,API_KEY,PLATFORM,STAGE,REGION } = process.env;
class AlarmDispatcher extends BaseHandler {

    constructor() {
        super();
    }

    async process(event, context, callback) {
        const awsManager = new awsmanager();
        try {
            console.log(JSON.stringify(event));
            const alarm = event.Records[0];
            if(!alarm){
                console.log('Invalid Alarm');
                return;
            }
            const subject = alarm.Sns.Subject;
            const message = JSON.parse(alarm.Sns.Message);
            const desc_arry = message.AlarmDescription.split('-');
            const tenant_name = desc_arry[0];
            const source_system = desc_arry[1];
            //const resource_type = desc_arry[3];
            const description = desc_arry[2];
            const body = {
                platform:'alarm',
                application:`${source_system}`,
                tenant:tenant_name,
                description:description,
                details:JSON.stringify({Tenant:tenant_name,Date:Date.now()}),
                date:Date.now()
              }
              console.log(`BODY:${JSON.stringify(body)}`);
              await helper.notify_monitoring_service(`${MONITORING_SERVICE_URL}/health`,API_KEY,awsManager,body);
            console.log(`###### ${STAGE.toUpperCase()} - END Processing Cloudwatch Alarm ###########`);
        } catch(err) {
            this.log.error(`Failed to process cloudwatch alarm`, err);
            await helper.notify_failure(awsManager,"alarm-dispatcher",err.message);
            return responseHelper.sendServerErrorResponse({
                message: err.message
            })
        }
    }
}

exports.dispatch = async(event, context, callback) => {
    return await new AlarmDispatcher().handler(event, context, callback);
};