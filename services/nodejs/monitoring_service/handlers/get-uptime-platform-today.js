const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, getUptimePlatformToday } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class GetUptimePlatformToday extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            let platform_id = event.pathParameters.platformId;
            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            let results = await getUptimePlatformToday(dbHelper, platform_id);
            dbHelper.conn.end();
            if (results) {
                let grouped_result = {};
                let output = {};

                for (const row of results) {
                    if (!grouped_result[row.grp]) {
                      grouped_result[row.grp] = {};
                    }
              
                    if (!grouped_result[row.grp][row.resource]) {
                      grouped_result[row.grp][row.resource] = [];
                    }
                    grouped_result[row.grp][row.resource].push(row);
                }
              
                for (const group_level_key in grouped_result) {
                    if (!output[group_level_key]) {
                        output[group_level_key] = {};
                    }
              
                    for (const resource_level_key in grouped_result[group_level_key]) {
                        if (!output[group_level_key][resource_level_key]) {
                            output[group_level_key][resource_level_key] = [];
                        }
              
                        const arrayOfObjects = grouped_result[group_level_key][resource_level_key];
                        const resultbydate = helper.persentTodays(arrayOfObjects);
                        output[group_level_key][resource_level_key] = resultbydate;
                    }
                }

                let resp = {
                    output
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Today Uptime Platform could not be fetched.'});
            }
        } catch(e) {
            this.log.error("Get uptime platform error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Today Uptime Platform could not be fetched.'});
        }
    }
}

exports.get_uptime_platform_today = async(event, context, callback) => {
    return await new GetUptimePlatformToday().handler(event, context, callback);
};