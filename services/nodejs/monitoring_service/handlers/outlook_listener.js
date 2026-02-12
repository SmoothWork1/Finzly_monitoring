const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const responseHelper = require('/opt/modules/common/response');
const { SQS_URL,OUTLOOK_USER,OUTLOOK_TENANTID,OUTLOOK_CLIENTID,OUTLOOK_SECRET,STAGE } = process.env;
const helper = require('./helper/helper.js');
const AWS = require("aws-sdk");
const axios = require("axios");
const qs = require("qs");
//AWS.config.update({ region: 'us-east-2' })
const ACM = new AWS.ACM({ apiVersion: '2015-12-08' })
const MAIL_INTERVAL = 15.5;
class VendorNotifications extends BaseHandler {
    constructor() {
        super();
    }
    async fetch_emails (awsManager){
        const token_endpoint = `https://login.microsoftonline.com/${OUTLOOK_TENANTID}/oauth2/v2.0/token`;
        const mail_endpoint = `https://graph.microsoft.com/v1.0/users/${OUTLOOK_USER}/messages`;
        
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const token = await axios.post(token_endpoint, qs.stringify({
            grant_type: "client_credentials",
            client_id: OUTLOOK_CLIENTID,
            client_secret: OUTLOOK_SECRET,
            scope:"https://graph.microsoft.com/.default"
        }), {headers});
        console.log(`token:${token.data.access_token}`);
        const response = await axios.create({
            headers:  {
              'Authorization': 'Bearer ' + token.data.access_token
            }
          }).get(mail_endpoint);
          for(const val of response.data.value){
            const subject = val.subject;
            const receivedOn = val.receivedDateTime
            const sender = val.sender.emailAddress.name
            const from = val.sender.emailAddress.address
            const content_type = val.body.contentType;
            const body = val.body.content;
            
            const now = new Date();
            const receivedDt = new Date(receivedOn);
            const tenant = from.split('@')[1];
            //console.log(`${subject};`);
            //console.log(now.toString());
            //console.log(receivedDt.toString());
            //console.log((now - receivedDt)/(60*1000));
            //console.log(body);
            const diff_minutes = (now-receivedDt)/(60*1000)
            if(diff_minutes > MAIL_INTERVAL){
                continue;
            }
            const event_id = await helper.createEventId(from,subject);
            const obj = {
                event_id:event_id,
                event_type: 'NOTIFICATIONS',
                source_system:subject,
                tenant_name: 'finzly',
                details: JSON.stringify({"Tenant":tenant,"Sender":sender,"Email":from}),
                description:body
            };
            console.log(JSON.stringify(obj));
            await awsManager.sendExpirationSQSMessageJSON(obj, SQS_URL);
            console.log('-------####-----------');
            break;
        }
    };
    async process(event, context, callback) {
        try {
            console.log(event.body);
            //const request = JSON.parse(event.body);
            //console.log(JSON.stringify(request));
            //console.log('--------------------');
            //console.log(request.content);
            //let SQS = new AWS.SQS({region:'us-east-2'});
            const awsManager = new awsmanager();
            const date = new Date();
            const hr_min = date.toLocaleTimeString('en-US', {
                timeZone: 'America/New_York',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            await this.fetch_emails(awsManager);
            /*
            const issue = request.issue;
            //const content = await this.fetch_datadog_details(request.content);
            const client = issue.fields.customfield_11200[0].name;
            const obj = {
                event_id:issue.key,
                event_type: 'PROD_ISSUES',
                source_system: `<a href='https://swapstech.atlassian.net/browse/${issue.key}' target='_blank' rel='noopener'>${issue.fields.summary}</a>`,
                tenant_name: 'finzly',
                details: JSON.stringify({"Tenant":client,"Reporter":issue.fields.reporter.displayName}),
                description:issue.fields.description
            };
            await awsManager.sendExpirationSQSMessageJSON(obj, SQS_URL);
            */
            return responseHelper.sendSuccessResponse({
                message: 'Process Complete'
            });
        } catch (err) {
            console.log(err);
            //this.log.info("Exception in logCHECK function :", err)
        }
    }
}

exports.vendor_notifications = async (event, context, callback) => {
    return await new VendorNotifications().handler(event, context, callback);
};