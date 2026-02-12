const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper.js');
const { MONITORING_SERVICE_URL,API_KEY,KEYCLOAK_HEALTH_URL,STAGE,REGION } = process.env;
class KeycloakMonitor extends BaseHandler {

    constructor() {
        super();
    }
    async getAccessToken (input,awsManager) {
        try{
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            const body =  awsManager.qs.stringify({
                grant_type: "client_credentials",
                client_id: input.client_id,
                client_secret: input.client_secret
            });
            var resp = await awsManager.axios.post(KEYCLOAK_HEALTH_URL,body,{headers});
        }catch(ex){
            console.log(ex);
        }

    }
    async notifyDashboard (awsManager) {
        try{
            const body = {
                platform:'alarm',
                application:`keycloak`,
                tenant:'finzly',
                description:'Keycloak is not responding',
                date:Date.now()
              }
              console.log('Alert: Keycloak is not responding');
              await helper.notify_monitoring_service(`${MONITORING_SERVICE_URL}/health`,API_KEY,awsManager,body);
        }catch(ex){
            console.log(ex);
        }

    }
    async process(event, context, callback) {
        const awsManager = new awsmanager();
        try {
            console.log(JSON.stringify(event));
            const key = `/config/bankos/global_${STAGE}/bankos.workflow.tenant.finzly.bank.apiaccount.secret`;
            const config = await helper.getConfigPropertiesByKeys([key],STAGE,awsManager);
            const value = config[key];
            const input = {
                client_id:'finzly.workflow.apiaccount',
                client_secret:value
                //client_secret:'88e53f4f-2b86-4c8e-9321-51ecbbc8db3e'
            }
            
            await this.getAccessToken(input,awsManager);
            console.log('ALL Good');
        } catch(err) {
            this.log.error(`Unable to connect to keycloak`, err);
            await this.notifyDashboard(awsManager);
        }
    }
}

exports.scheduler = async(event, context, callback) => {
    return await new KeycloakMonitor().handler(event, context, callback);
};