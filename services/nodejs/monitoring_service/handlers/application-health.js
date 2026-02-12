const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const responseHelper = require('/opt/modules/common/response');
const { SQS_URL,CROSSACCOUNT_ID,CROSSACCOUNT_ROLE,STAGE } = process.env;
const helper = require('./helper/helper.js');
const AWS = require("aws-sdk");
//AWS.config.update({ region: 'us-east-2' })
const ACM = new AWS.ACM({ apiVersion: '2015-12-08' })

class ApplicationAlerts extends BaseHandler {
    constructor() {
        super();
    }
    async fetch_datadog_alarm_details(content) {
        var details = {
            tenant:'BankOS',
            application:'UNKNOWN',
            description:'none'

        };
        if(content){
          const ary = content.split('##');
          if(ary.length > 2){
              if(ary[1] != null){
                  const data = ary[1].trim().split('#');
                  details.application=data[1];
                  details.description = data[2];
              }
          }
        }
        return details;
    }
    async fetch_datadog_details(content) {
        var details = null;
        if(content){
          const ary = content.split('##');
          console.log(ary);
          if(ary.length > 2){
              if(ary[1] != null){
                  console.log(ary[1].trim());
                  details = JSON.parse(`${ary[1].trim()}`);
              }
          }
        }
        return details;
    }
    
    async handle_client_adapter_alarm(request){
        const platform = request.platform;
        const application = request.application;
        const tenant = request.tenant;
        const description = request.description;
        const event_id = await helper.createEventId(tenant,application);
        const obj = {
            event_id:event_id,
            event_type: 'SERVER_HEALTH',
            source_system: application,
            tenant_name: 'finzly',
            details: JSON.stringify({"Tenant":tenant}),
            description:description
        };
        return obj;
    }
    async handle_fxstar_process_scan(request){
        const platform = request.platform;
        const application = request.application;
        const tenant = request.tenant;
        const description = request.description;
        const event_id = await helper.createEventId(tenant,application);
        const obj = {
            event_id:event_id,
            event_type: 'SERVER_HEALTH',
            source_system: application,
            tenant_name: 'finzly',
            details: JSON.stringify({"Time":request.date,"Tenant":tenant}),
            description:description
        };
        return obj;
    }
    async handle_bankos_process_scan(request){
        console.log(request.content);
        //let SQS = new AWS.SQS({region:'us-east-2'});
        const content = await this.fetch_datadog_details(request.content);
        const event_id = await helper.createEventId('finzly',content.container);
        const obj = {
            event_id:event_id,
            event_type: 'SERVER_HEALTH',
            source_system: `${content.container}`,
            tenant_name: 'finzly',
            details: JSON.stringify({"Time":request.date,"Message":request.title}),
            description:content.description
        };
        return obj;
    }
    async handle_aws_alarms(request){
        const event_id = await helper.createEventId(request.description,request.application);
        const obj = {
            event_id:event_id,
            event_type: 'SERVER_HEALTH',
            source_system: `${request.application}`,
            tenant_name: 'finzly',
            //details: JSON.stringify({"Tenant":request.tenant,"Time":request.date}),
            details: request.details,
            description:request.description
        };
        return obj;
    }
    async handle_datadog_alarms(request){
        const data = await this.fetch_datadog_alarm_details(request.content);
        const event_id = await helper.createEventId('finzly',data.application);
        const obj = {
            event_id:event_id,
            event_type: request.event_type,
            source_system: `${data.application}`,
            tenant_name: 'finzly',
            details: JSON.stringify({"Tenant":"BankOS","Time":request.date}),
            description:data.description
        };
        return obj;
    }
    
    async process(event, context, callback) {
        try {
            console.log(event.body);
            const request = JSON.parse(event.body);

            var message_obj = null;
            if(request.hasOwnProperty('platform') && request.platform == 'fxstar'){
                message_obj = await this.handle_fxstar_process_scan(request);
            }else if(request.hasOwnProperty('platform') && request.platform == 'client_adapter'){
                message_obj = await this.handle_client_adapter_alarm(request);
            }else if(request.hasOwnProperty('platform') && request.platform == 'alarm'){
                message_obj = await this.handle_aws_alarms(request);
            }else if(request.hasOwnProperty('platform') && request.platform.toUpperCase() == 'DATADOG'){
                message_obj = await this.handle_datadog_alarms(request);
            }else{
                message_obj = await this.handle_bankos_process_scan(request);
            }
            const awsManager = new awsmanager();
            console.log(`SQS_URL:${SQS_URL}`);
            await awsManager.sendExpirationSQSMessageJSON(message_obj, SQS_URL);
            return responseHelper.sendSuccessResponse({
                message: 'Process Complete'
            });
        } catch (err) {
            console.log(err);
            //this.log.info("Exception in logCHECK function :", err)
        }
    }
}

exports.application_health = async (event, context, callback) => {
    return await new ApplicationAlerts().handler(event, context, callback);
};