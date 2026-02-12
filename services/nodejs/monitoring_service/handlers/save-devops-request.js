const responseHandler = require('/opt/modules/common/response');
const BaseHandler = require('/opt/modules/common/basehandler');
const utils = require('/opt/modules/common/utils');
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, saveDevOpsRequest } = require('./helper/sql-monitoring.js');
const { STAGE } = process.env;

class Save_DevOps_Request extends BaseHandler {
    // this is main function
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            let body = event.body ? JSON.parse(event.body) : event;
            let awsManager = new awsmanager();
            await utils.validate(body, helper.get_devops_request_schema());
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            const devops_request = await saveDevOpsRequest(dbHelper, {
                execution_date: body.execution_date,
                command: body.command,
                requester: this.user_id,
            });
            dbHelper.conn.end();
            this.log.info("DevOps Request added: ", devops_request);
            if (devops_request) {
                let resp = {
                    message: "DevOps Request added successfully"
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'DevOps Request could not be added.'});
            }
        } catch(e) {
            this.log.error("Add devops request Error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Could not add devops request.'});
        }
    }
}

exports.save_devops_request = async(event, context, callback) => {
    return await new Save_DevOps_Request().handler(event, context, callback);
};