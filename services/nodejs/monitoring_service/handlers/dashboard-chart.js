const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getTenantsTotals, getTypesTotal, getStatusTotal, getMonitoringUserByID } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class DashboardChart extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            
            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            // const user_record = await getMonitoringUserByID(dbHelper, this.user_id);
            // if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
            //     return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            // }


            let active_tenant = event.pathParameters.tenant;
            let active_type = event.pathParameters.type;

            const tenant_counts = [];
            const tenant_kinds = [];
            // Total tenants and events count for every tenant
            const tenants_total = await getTenantsTotals(dbHelper);
            if(tenants_total && tenants_total.length > 0) {
                if(active_tenant == '0') {
                    active_tenant = tenants_total[0].tenant_name
                }

                for(const tenant_item of tenants_total) {
                    tenant_counts.push(tenant_item.total);
                    tenant_kinds.push(tenant_item.tenant_name)
                }
            }

			// Total event types and events count for every type
			const types_total =await getTypesTotal(dbHelper, active_tenant);
            const types_counts = [];
            const types_kinds = [];
            if(types_total && types_total.length > 0) {
                if(active_type == '0') {
                    active_type = types_total[0].event_type
                }
                
                for(const type_item of types_total) {
                    types_counts.push(type_item.total);
                    types_kinds.push(type_item.event_type);
                }
            }
			
            // Total event types and events count for every type
			const status_total =await getStatusTotal(dbHelper, active_type);
            const status_counts = [];
            const status_kinds = [];
            if(status_total && status_total.length > 0) {
                for(const status_item of status_total) {
                    status_counts.push(status_item.total);
                    status_kinds.push(status_item.status);
                }
            }
            
			let resp = {
                tenant_counts,
				tenant_kinds,
				types_counts,
				types_kinds,
                status_counts,
                status_kinds,
                active_tenant,
                active_type
			};
			return responseHandler.sendSuccessResponse(resp);
        } catch(e) {
            this.log.error("Get dashboard error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Dashboard could not be fetched.'});
        }
    }
}

exports.dashboard_chart = async(event, context, callback) => {
    return await new DashboardChart().handler(event, context, callback);
};