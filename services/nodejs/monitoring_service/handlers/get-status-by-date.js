const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, getStatusByDate } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class GetStatusByDate extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            let platform_id = event.pathParameters.platformId;
            let grp = event.pathParameters.grp;
            let resource = event.pathParameters.resource;
            let specificdate = event.pathParameters.specificdate;

            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            let results = await getStatusByDate(dbHelper, platform_id, grp, resource, specificdate);
            dbHelper.conn.end();
            if (results) {
                let resp = {
                    results
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Status could not be fetched by date.'});
            }
        } catch(e) {
            this.log.error("Get status by date error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Status could not be fetched by date.'});
        }
    }
}

exports.get_status_by_date = async(event, context, callback) => {
    return await new GetStatusByDate().handler(event, context, callback);
};