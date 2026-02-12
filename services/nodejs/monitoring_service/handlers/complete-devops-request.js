const responseHandler = require('/opt/modules/common/response');
const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, completeDevOpsRequest } = require('./helper/sql-monitoring.js');
const { STAGE } = process.env;

class Complete_DevOps_Request extends BaseHandler {
    // this is main function
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            let request_id = event.pathParameters.requestid;
            let awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            const devops_request = await completeDevOpsRequest(dbHelper, {
                id: request_id,
                requester: this.user_id,
            });
            dbHelper.conn.end();
            this.log.info("DevOps request completed: ", devops_request);
            if (devops_request) {
                let resp = {
                    message: "DevOps request completed successfully"
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'DevOps request could not be completed.'});
            }
        } catch(e) {
            this.log.error("Complete devops request error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Could not complete devops request.'});
        }
    }
}

exports.complete_devops_request = async(event, context, callback) => {
    return await new Complete_DevOps_Request().handler(event, context, callback);
};