const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getActiveTenants } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class GetActiveTenants extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection_with_config(awsManager, STAGE);

            const all_tenants = await getActiveTenants(dbHelper, STAGE);
            const total_tenants = [];
            for(const obj of all_tenants){
                for(const tenant_name of obj.tenants) {
                    const param = {
                        stage: obj.stage,
                        name: tenant_name
                    }
                    total_tenants.push(param);
                }
            }

            let resp = {
                total_tenants
            };
            return responseHandler.sendSuccessResponse(resp);
        } catch(e) {
            this.log.error("Get active tenants error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Active Tenants could not be fetched.'});
        }
    }
}

exports.get_active_tenants = async(event, context, callback) => {
    return await new GetActiveTenants().handler(event, context, callback);
};