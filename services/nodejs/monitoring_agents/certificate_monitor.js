const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const responseHelper = require('/opt/modules/common/response');
const {MONITORING_SERVICE_URL,MONITORING_SQS_NAME,REGION,STAGE} = process.env;
const SQLHelper = require('/opt/modules/common/mysql_helper');
const helper = require('./helper.js');
const https = require('https');
const AWS = require("aws-sdk");
const { X509Certificate } = require('crypto');
AWS.config.update({ region: REGION })
const ACM = new AWS.ACM({ apiVersion: '2015-12-08' })
var ONE_DAY = 1000 * 60 * 60 * 24
const CURRENT_DATE = new Date();

const DAYS_TO_EXP = 45;
const KEYMANAGER_API_KEY = "87528B5B-C51C-44E1-88D4-9765636763FD";
const API_KEY = process.env.API_KEY;
const KEYMANAGER_URL = "https://cert.finzly.net/api/pki/restapi/getAllSSLCertificates";
class CertificateMonitor extends BaseHandler {
    constructor() {
        super();
    }
    async process(event, context, callback) {
        const tenant_name = 'finzly';
        const awsManager = new awsmanager();
        let error_desc = null;
        try{
            const key_manager_url = `${KEYMANAGER_URL}?INPUT_DATA={"operation":{"Details":{"withExpiryDaysLessThan":"${DAYS_TO_EXP}"}}}`;
            const headers = {
                'AUTHTOKEN': KEYMANAGER_API_KEY
            };
            try{
            const date = new Date();
            const executed_on = date.toLocaleString('en-US', {timeZone: 'America/New_York',})
            // const obj = {
            //     event_id: event_id,
            //     source_system: source_system,
            //     description: description,
            //     executed_on: executed_on
            // }
            let SQS = new AWS.SQS({region:REGION});
            const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
            var resp = await awsManager.axios.get(key_manager_url,{headers:headers});
            const records = resp.data.details;
            for(const record of records){
                try{
                    const exp_date = record['ExpiryDate'];
                    const issuer = record['Issuer'];
                    const fqdn = record['DNS Name/FQDN'];
                    let desc = record['Description'];
                    let cert_tenant = "BankOS/FX";
                    let description = `${fqdn} Certificate Expires on ${exp_date}`;
                    if(desc != null && desc.lenght > 0){
                        const ary = desc.split(':'); //Ex: "WAB:FXSTAR WAB UAT2 EFXTEST DNS"
                        if(ary.lenght > 1){
                            if(ary[0] != null && ary[0].trim().lenght > 0){
                                cert_tenant = ary[0]
                                description = ary[1];
                            }
                        }
                    }
                    let obj = {
                        event_id:fqdn,
                        event_type: "SSL_EXPIRATIONS",
                        source_system: `CERTIFICATE_MANAGER`,
                        tenant_name: cert_tenant,
                        description: description,
                        details: JSON.stringify({
                            "Tenant":cert_tenant,
                            "Host": fqdn,
                            "Expires ON": exp_date,
                            "Issuer": issuer
                        })
                    };
                    
                    if (queueUrl) {
                        const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                        this.log.info("Notification send successfully :: ", obj)
                    }      
                    //await helper.notify_monitoring_service(`${MONITORING_SERVICE_URL}/exceptions`,API_KEY,awsManager,obj);
                }catch(ex){
                    console.log(ex);

                } 
            }
            }catch(err){
                console.log(err);
                throw new Error(`Process failed: ${err.message}`);
            }
            await helper.register_heartbeat(
                `${MONITORING_SERVICE_URL}/heartbeat`,
                API_KEY,
                awsManager,
                'SSL_EXPIRATIONS',
                `BankOS`,
                `SSL Certificate Expiration Check`
            );
        }catch(err){
            console.log(err);
            await helper.notify_failure(awsManager,"certificate_monitor",err.message);
            return responseHelper.sendServerErrorResponse({
                message: err.message
            })
        }
    }
}

exports.scheduler = async (event, context, callback) => {
    return await new CertificateMonitor().handler(event, context, callback);
};