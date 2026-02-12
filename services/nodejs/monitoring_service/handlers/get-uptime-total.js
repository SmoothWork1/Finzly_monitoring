const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, getUptimeTotal } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class GetUptimeTotal extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            let app_name = event.pathParameters.appName;
            let starting_date = event.pathParameters.startingDate;
            let last_date = event.pathParameters.lastDate;

            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }
            
            let results = await getUptimeTotal(dbHelper, app_name, starting_date, last_date);
            dbHelper.conn.end();
            if (results) {
                const rdsList = helper.persentDays(
                    results,
                    starting_date,
                    last_date
                );
                let resp = {
                    rdsList
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Uptime Total could not be fetched.'});
            }
        } catch(e) {
            this.log.error("Get uptime total error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Uptime Total could not be fetched.'});
        }
    }
}

exports.get_uptime_total = async(event, context, callback) => {
    return await new GetUptimeTotal().handler(event, context, callback);
};