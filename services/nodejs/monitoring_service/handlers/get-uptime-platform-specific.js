const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, getUptimePlatformSpecific } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class GetUptimePlatformSpecific extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            let platform_id = event.pathParameters.platformId;
            let grp = event.pathParameters.grp;
            let resource = event.pathParameters.resource;
            let specificdate = event.pathParameters.specificdate;
            let description = event.pathParameters.textareaContent;

            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            let results = await getUptimePlatformSpecific(dbHelper, platform_id, grp, resource, specificdate, description);
            dbHelper.conn.end();
            if (results) {
                let resp = {
                    results
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Specific Uptime Platform could not be fetched.'});
            }
        } catch(e) {
            this.log.error("Get uptime platform error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Specific Uptime Platform could not be fetched.'});
        }
    }
}

exports.get_uptime_platform_specific = async(event, context, callback) => {
    return await new GetUptimePlatformSpecific().handler(event, context, callback);
};