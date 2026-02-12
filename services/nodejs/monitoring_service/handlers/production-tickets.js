const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const responseHelper = require('/opt/modules/common/response');
const { SQS_URL,CROSSACCOUNT_ID,CROSSACCOUNT_ROLE,STAGE } = process.env;
const helper = require('./helper/helper.js');
const AWS = require("aws-sdk");
//AWS.config.update({ region: 'us-east-2' })
const ACM = new AWS.ACM({ apiVersion: '2015-12-08' })

const tenant_name_map = new Map();
tenant_name_map["Western Alliance Bank"]="wab";
tenant_name_map["Pacific Premier Bank"]="ppb";
tenant_name_map["Texas First Bank"]="tfb";
tenant_name_map["First Horizon bank"]="fhb";
tenant_name_map["Fulton Bank"]="ffc";
tenant_name_map["Umpqua Bank"]="uqa";
tenant_name_map["Lead Bank"]="leadbank";
tenant_name_map["First Citizens Bank"]="fcb";
tenant_name_map["Manufacturers Bank"]="manu";
tenant_name_map["First Bank"]="fb";
tenant_name_map["First National Bank"]="fnb";
tenant_name_map["1st Source Bank"]="1stsb";
tenant_name_map["Axos Bank"]="axos";
tenant_name_map["Arvest Bank"]="arv";
tenant_name_map["Customers Bank"]="cubi";
tenant_name_map["Live Oak Bank"]="lob";
tenant_name_map["Quaint Oak Bank"]="qob";

class ProductionTickets extends BaseHandler {
    constructor() {
        super();
    }
    async fetch_datadog_details(content) {
        var details = null;
        if(content){
          const ary = content.split('##');
          if(ary.length > 2){
              if(ary[1] != null){
                  details = JSON.parse(`${ary[1].trim()}`);
              }
          }
        }
        return details;
    }
    async process(event, context, callback) {
        try {
            //console.log(event.body);
            const request = JSON.parse(event.body);
            //console.log(JSON.stringify(request));
            //console.log('--------------------');
            //console.log(request.content);
            //let SQS = new AWS.SQS({region:'us-east-2'});
            const awsManager = new awsmanager();
            const issue = request.issue;
            //const content = await this.fetch_datadog_details(request.content);
            const client = issue.fields.customfield_11200[0].name;
            console.log(`${issue.key}: ${client}`);
            const tenant_name = tenant_name_map.has("client")?tenant_name_map["client"]:"finzly";
            const obj = {
                event_id:issue.key,
                event_type: 'PROD_ISSUES',
                source_system: `<a href='https://swapstech.atlassian.net/browse/${issue.key}' target='_blank' rel='noopener'>${issue.fields.summary}</a>`,
                tenant_name: tenant_name,
                details: JSON.stringify({"Tenant":client,"Reporter":issue.fields.reporter.displayName}),
                description:issue.fields.description
            };
            await awsManager.sendExpirationSQSMessageJSON(obj, SQS_URL);
            return responseHelper.sendSuccessResponse({
                message: 'Process Complete'
            });
        } catch (err) {
            console.log(err);
            //this.log.info("Exception in logCHECK function :", err)
        }
    }
}

exports.production_tickets = async (event, context, callback) => {
    return await new ProductionTickets().handler(event, context, callback);
};