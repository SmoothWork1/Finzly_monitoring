const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getDevOpsRequests, getMonitoringUserByID } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class Get_DevOps_Requests extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }
            
            let requests = await getDevOpsRequests(dbHelper);
            dbHelper.conn.end();
            if (requests) {
                requests = await Promise.all(requests.map( async (rqst) => ({
                    ...rqst,
                    requester: (await getMonitoringUserByID(dbHelper, rqst.requester)),
                })));
                let resp = {
                    requests
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'DevOps Requests could not be fetched.'});
            }
        } catch(e) {
            this.log.error("Get devops requests error: ", e);
            return responseHandler.sendBadReqResponse({message: 'DevOps requests could not be fetched.'});
        }
    }
}

exports.get_devops_requests = async(event, context, callback) => {
    return await new Get_DevOps_Requests().handler(event, context, callback);
};