const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getDashboardTotals, getRecentEvents, getMonitoringEvents, getRecentEventsByTenant, getMonitoringUserByID, getDashboardTotalsByTenant } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class Dashboard extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            const awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user = await getMonitoringUserByID(dbHelper, this.user_id);
            if(user.type === 'Other User' && (this.tenant_name != user.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            // Total numbers for dashboard tabs
            const otherUser = user.type === 'Other User';

            const statuses = otherUser ?
                await getDashboardTotalsByTenant(dbHelper, this.tenant_name, user.tenant_id)
            :
                await getDashboardTotals(dbHelper, this.tenant_name);
			const totals = helper.sortDashboardTotals(statuses);
            // Recent events for dashboard tabs' contents
			const active = otherUser ?
                await getRecentEventsByTenant(dbHelper, this.tenant_name, "Active", user.tenant_id)
            :
                await getRecentEvents(dbHelper, this.tenant_name, "Active");
			const ignored = otherUser ?
                await getRecentEventsByTenant(dbHelper, this.tenant_name, "Ignored", user.tenant_id)
            :
                await getRecentEvents(dbHelper, this.tenant_name, "Ignored");
			const resolved = otherUser ?
                await getRecentEventsByTenant(dbHelper, this.tenant_name, "Resolved", user.tenant_id)
            :
                await getRecentEvents(dbHelper, this.tenant_name, "Resolved");

            // User Events to show total numbers and active ones
            const conditionQuery = otherUser ?
                `tenant_name = '${user.tenant_id}' AND user_id = '${this.user_id}' AND status != 'Ignored'`
            :
                `user_id = '${this.user_id}' AND status != 'Ignored'`;
            const allEvents = await getMonitoringEvents(dbHelper, conditionQuery);
            dbHelper.conn.end();
            const userActives = allEvents.filter( (e) => (e.status === 'Active'));
            const userResolved = allEvents.filter( (e) => (e.status === 'Resolved'));
			let resp = {
                // Dashboard tabs data
				totals,
				active,
				ignored,
				resolved,

                // Events Assigned to User
                userActives,
                userResolved
			};
			return responseHandler.sendSuccessResponse(resp);
        } catch(e) {
            this.log.error("Get dashboard error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Dashboard could not be fetched.'});
        }
    }
}

exports.dashboard = async(event, context, callback) => {
    return await new Dashboard().handler(event, context, callback);
};