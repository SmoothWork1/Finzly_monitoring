const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const AWS = require("aws-sdk");
const helper = require('./helper.js');
const responseHelper = require('/opt/modules/common/response');
const { STAGE,MONITORING_SQS_NAME,REGION} = process.env;
const MONITORING_SERVICE_URL = process.env.MONITORING_SERVICE_URL;
const API_KEY = process.env.API_KEY;
class VPNStatus extends BaseHandler {
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
            const ec2 = new AWS.EC2({ region: REGION });  // Set your AWS region
            const data = await ec2.describeVpnConnections({}).promise();
            const results = [];
            if (data.VpnConnections.length > 0) {
                for(const vpnConnection of data.VpnConnections){
                    try{

                        const tags = vpnConnection.Tags;
                        var name = 'No Name VPN';
                        for(const tag of tags){
                            if('Name' === tag.Key){
                                name = tag.Value;
                            }
                        }
                        console.log(`${name}: ${vpnConnection.State}`);
                        if('available' != vpnConnection.State){
                            results.push({
                                Tenant:'finzly',
                                Name:name,
                                Status: vpnConnection.State,
                                Description:'VPN is offline'
                            })
                        }               
                    }catch(ex){
                        console.log(ex);
                        results.push({
                            Tenant:'finzly',
                            Name:'Unknown',
                            Status: 'Unknown',
                            Description:'Unable to fetch vpn details'
                        });
                    }
                }
            }else{
                console.log('VPN connection not found');
                results.push({
                    Tenant:'finzly',
                    Name:'None',
                    Status: 'None',
                    Description:'No VPN Configurations found'
                });
            }
            if(results.length > 0){
                const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                for(const result of results){
                    const event_id = await helper.createEventId(result.Tenant,result.Name);
                    let obj = {
                        event_id:event_id,
                        event_type: 'VPN_STATUS',
                        source_system: `BankOS`,
                        tenant_name: result.Tenant,
                        details: JSON.stringify(result),
                        description:result.Description
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
                'VPN_STATUS',
                'BankOS',
                `VPN Status Check`
            );
        } catch (err) {
            this.log.error(`Internal Server Error: `, err);
            await helper.notify_failure(awsManager,"vpn-status-check",err.message);
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
    return await new VPNStatus().handler(event, context, callback);
};