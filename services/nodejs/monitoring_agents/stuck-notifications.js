const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const AWS = require("aws-sdk");
const helper = require('./helper.js');
const ENUM = require('./enum.js');
const responseHelper = require('/opt/modules/common/response');
const { STAGE,MONITORING_SQS_NAME,MONITORING_SERVICE_URL,API_KEY,TIME_LAPSE,STUCK_NOTIFICATIONS_STATUS_LIST,REGION} = process.env;

class StuckNotifications extends BaseHandler {
    constructor() {
        super();
    }
    async check_notifications(qry,tenant_name,connection,awsManager) {
        const statusAry = STUCK_NOTIFICATIONS_STATUS_LIST.split(',')
        const status = `'${statusAry.join("','")}'`;
        qry = qry.replace(/%%TENANT_NAME%%/g, tenant_name)
        .replace(/%%STATUS%%/g, status)
        .replace(/%%TIME_LAPSE%%/g, TIME_LAPSE);

        //const qry = `group_concat(SOURCE_ID) as sourceIds, status, count(*) as count from galaxy_notifications_${tenant_name}.NOTIFICATION_REQUEST where date(DATE_CREATED)=curdate() and STATUS in (${status}) and (now() - DATE_CREATED) > ${TIME_LAPSE} group by status`;
        const results = await helper.query(qry,connection);
        const records = []
        if(results){
            for(const result of results){

                records.push({
                    "Tenant":tenant_name,
                    "Status":result.status,
                    "Count":result.count,
                    "SourceIds":result.sourceIds
                });
            }
        }
        return records
    }
    async process(event, context, callback) {
        const awsManager = new awsmanager();
        let error_desc = null;
        var monitoring_db_conn =  null;
        try{
            this.log.info(event);
            let message = "Process completed."
            let SQS = new AWS.SQS({region:REGION});
            const monitoring_db_conn = await helper.create_connection_with_monitoring_db(STAGE, awsManager);
            if (!monitoring_db_conn) {
                error_desc = 'Unable to connect to monitoring  database';
                this.log.error(error_desc);
                throw new Error(`Process failed: ${error_desc}`);
            }
            let condition =`lambda_name = '${ ENUM.queries_identifier.STUCK_NOTIFICATIONS }';`
            let queries = await helper.fetch_queries(condition,monitoring_db_conn)
            console.log(`#### Queries: ${JSON.stringify(queries)}`);
            const tenants = await helper.fetchActiveTenants(STAGE,awsManager);
            for(const tenant_name of tenants){
                if(['oceanfirstbank','snb','finzly'].includes(tenant_name)){
                    continue;
                }
                var connection = null;
                try{
                    connection = await helper.create_connection_with_tenant_db(STAGE, tenant_name, awsManager);
                    if (!connection) {
                        error_desc = `Not able to read the ${tenant_name} database server properties from parameter store`;
                        throw new Error(`Process failed: ${error_desc}`);
                    }
                    const stuckNotificationsQry = queries.find(query => query.query_name ===  'stuck_notifications');
                    const results = await this.check_notifications(stuckNotificationsQry.query,tenant_name,connection,awsManager);
                    if(results){
                        const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                        for(const result of results){
                            let obj = {
                                event_id:`${Date.now()}`,
                                event_type: 'NOTIFICATION_PENDING_DELIVERY',
                                source_system: `Notifications`,
                                tenant_name: tenant_name,
                                details: JSON.stringify(result),
                                description:`Notifications are stuck in - ${STUCK_NOTIFICATIONS_STATUS_LIST}`
                            };
                            if (queueUrl) {
                                const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                this.log.info("Notification send successfully :: ", obj)
                            }
                        }
                    }
                }catch(ex){
                    this.log.error(`Failed execute queries for tenant: ${tenant_name}: `, ex);
                    await helper.notify_failure(awsManager,"stuck-notifications",ex.message);
                }finally{
                    if (connection && connection.end) {
                        connection.end();
                    }
                }
            }
            await helper.register_heartbeat(
                `${MONITORING_SERVICE_URL}/heartbeat`,
                API_KEY,
                awsManager,
                'NOTIFICATION_PENDING_DELIVERY',
                'BankOS',
                `SSL Certificate Expiration Check`
            );
        } catch (err) {
            this.log.error(`Internal Server Error: `, err);
            await helper.notify_failure(awsManager,"stuck-notifications",err.message);
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
    return await new StuckNotifications().handler(event, context, callback);
};