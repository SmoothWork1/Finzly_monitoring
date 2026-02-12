const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, rmDevOpsRequest } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class Remove_DevOps_Request extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
			let request_id = event.pathParameters.requestid;
			const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }
            
            let devops_request = await rmDevOpsRequest(dbHelper, {
                id: request_id,
                requester: this.user_id,
            });
            dbHelper.conn.end();
            if (devops_request) {
                let resp = {
                    message: "Removed devops request successfully"
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'DevOps request could not be removed.'});
            }
        } catch(e) {
            this.log.error("Remove devops request error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Could not remove devops request.'});
        }
    }
}

exports.remove_devops_request = async(event, context, callback) => {
    return await new Remove_DevOps_Request().handler(event, context, callback);
};