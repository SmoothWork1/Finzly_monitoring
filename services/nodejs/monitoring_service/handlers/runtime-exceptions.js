const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const responseHelper = require('/opt/modules/common/response');
const { SQS_URL,CROSSACCOUNT_ID,CROSSACCOUNT_ROLE,STAGE } = process.env;
const helper = require('./helper/helper.js');
const AWS = require("aws-sdk");
//AWS.config.update({ region: 'us-east-2' })
const ACM = new AWS.ACM({ apiVersion: '2015-12-08' })

class RuntimeExceptions extends BaseHandler {
    constructor() {
        super();
    }
    /*async fetch_datadog_details(content) {
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
    }*/
    async fetch_datadog_details(request) {
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
    async process(event, context, callback) {
        try {
            console.log(event.body);
            const request = JSON.parse(event.body);
            const message_obj = {
                event_id:request.event_id.toString(),
                event_type: request.event_type,
                source_system: `${request.source_system}`,
                tenant_name: 'finzly',
                details: request.details,
                description:request.description
            };
            if(request.source_system == 'DATADOG'){
                const ary = request.description.split(":");
                message_obj.source_system = ary[1];
                message_obj.description = ary[2];
                message_obj.details = JSON.stringify(request.details);
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

exports.runtime_exceptions = async (event, context, callback) => {
    return await new RuntimeExceptions().handler(event, context, callback);
};