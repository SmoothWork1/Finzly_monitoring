const BaseHandler = require('/opt/modules/common/basehandler');
const util = require('util');
const { STAGE, DB_TENANT } = process.env;
const helper = require('./helper/helper');
const awsmanager = require('/opt/modules/common/awsmanager');
const { getDashboardTotals, getMonitoringEvents, getRecentEvents, getViewedNotifications, getActiveEvents, getEventCountByType, getActiveEventsByGivenTypes, getMonitoringEventCount, getHeartbeats, getMonitoringUserByID, getRecentEventsByTenant, getActiveEventsByTenant, getEventCountByTypeAndTenant } = require('./helper/sql-monitoring');

class EventsWebsocket extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            console.log("EVENT WEBSOCKET REQUEST: ", event);
			let body = event.body ? JSON.parse(event.body) : event;
			if (!body.actionPack) {
				this.log.error('Invalid Request', event);
				return;
			}

            const domain = event.requestContext.domainName;
            const stage = event.requestContext.stage;
            const connectionId = event.requestContext.connectionId;
            const callbackUrlForAWS = util.format(util.format('https://%s/%s', domain, stage)); // construct the needed url
            const awsManager = new awsmanager();
			const dbHelper = await helper.create_db_connection(STAGE, DB_TENANT, awsManager);
			const user = await getMonitoringUserByID(dbHelper, body.user_id);
			const otherUser = user.type === 'Other User';

			switch(body.actionPack) {
				case "dashboard":
					// Total numbers for dashboard tabs
					const statuses = await getDashboardTotals(dbHelper, DB_TENANT);
					const totals = helper.sortDashboardTotals(statuses);
		
					// Recent events for dashboard tabs' contents
					const active = otherUser ?
						await getRecentEventsByTenant(dbHelper, DB_TENANT, "Active", user.tenant_id)
					:
						await getRecentEvents(dbHelper, DB_TENANT, "Active");
					const ignored = otherUser ?
						await getRecentEventsByTenant(dbHelper, DB_TENANT, "Ignored", user.tenant_id)
					:
						await getRecentEvents(dbHelper, DB_TENANT, "Ignored");
					const resolved = otherUser ?
						await getRecentEventsByTenant(dbHelper, DB_TENANT, "Resolved", user.tenant_id)
					:
						await getRecentEvents(dbHelper, DB_TENANT, "Resolved");

					// User Events to show total numbers and active ones
					const dashConditionQuery = otherUser ?
						`tenant_name = '${DB_TENANT}' AND user_id = '${body.user_id}' AND status != 'Ignored' AND tenant_id = '${user.tenant_id}'`
					:
						`tenant_name = '${DB_TENANT}' AND user_id = '${body.user_id}' AND status != 'Ignored'`;
					let allEvents = await getMonitoringEvents(dbHelper, dashConditionQuery);
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
					await helper.sendMessageToClient(callbackUrlForAWS, connectionId, resp)
					.catch( (e) => {/* this.log.error(`WEBSOCKET SEND MESSAGE ERROR FOR ${soc.conn_id}: `, e) */});
					break;
				case "notifications":
					const notifications = otherUser ?
						await getActiveEventsByTenant(dbHelper, DB_TENANT, "Active", user.tenant_id)
					:
						await getActiveEvents(dbHelper, DB_TENANT, "Active");
					const viewed = await getViewedNotifications(dbHelper, body.user_id);
					const cleanViewed = viewed.map( (v) => v.event_id );
					const filteredEvents = notifications.filter( (e) => 
											cleanViewed.indexOf(e.event_id) === -1
											&& e.event_type !== 'RUNTIME_EXCEPTIONS'
										);
					const more = filteredEvents.length > 10;
					const finalEvents = filteredEvents.slice(0, 10);
					if (finalEvents) {
						const resp = {
							notifications: finalEvents,
							more
						};
						await helper.sendMessageToClient(callbackUrlForAWS, connectionId, resp)
						.catch( (e) => {/* this.log.error(`WEBSOCKET SEND MESSAGE ERROR FOR ${soc.conn_id}: `, e) */});
					} else {
						await helper.sendMessageToClient(callbackUrlForAWS, connectionId, {message: 'Notifications could not be fetched.'})
						.catch( (e) => {/* this.log.error(`WEBSOCKET SEND MESSAGE ERROR FOR ${soc.conn_id}: `, e) */});
					}
					break;
				case "event_counts":
					// let eventTypes = await awsManager.getTodayEventCountByType();
					let eventTypes = otherUser ?
						await getEventCountByTypeAndTenant(dbHelper, user.tenant_id)
					:
						await getEventCountByType(dbHelper);
					// eventTypes = [...eventTypes, ...(await awsManager.getScheduledEventCountByType())];
					const eventsObj = helper.sortEventTypeCounts(eventTypes);
					if (eventsObj) {
						let resp = {
							counts: eventsObj
						};
						await helper.sendMessageToClient(callbackUrlForAWS, connectionId, resp);
					} else {
						await helper.sendMessageToClient(callbackUrlForAWS, connectionId, {message: 'Monitoring event badges could not be fetched.'});
					}
					break;
				case "blocks":
					const condQuery = helper.convertEventTypesToQueryCondition('event_type', [
						"prod_issues", "ssl_expirations", "server_health", "payment_failure", "ach_failure", "stuck_payments",
						"rt_exceptions", "app_process_health", "bulkfile", "mq_health", "pass_exp", "up_conns", "vpn_status", /* "sched_maint", */ "rt_messaging",
						"notification", "job"
					]);
					const eventBlocks = otherUser ? 
						await getActiveEventsByGivenTypes(dbHelper, `(${condQuery}) AND tenant_id = ${user.tenant_id}`)
					:
						await getActiveEventsByGivenTypes(dbHelper, condQuery);
					const eventBlocksObj = helper.sortEventTypeBlocks(eventBlocks);
					if (eventBlocksObj) {
						let resp = {
							blocks: eventBlocksObj
						};
						await helper.sendMessageToClient(callbackUrlForAWS, connectionId, resp)
						.catch( (e) => {/* this.log.error(`WEBSOCKET SEND MESSAGE ERROR FOR ${soc.conn_id}: `, e) */});
					} else {
						await helper.sendMessageToClient(callbackUrlForAWS, connectionId, {message: 'Monitoring event blocks could not be fetched.'})
						.catch( (e) => {/* this.log.error(`WEBSOCKET SEND MESSAGE ERROR FOR ${soc.conn_id}: `, e) */});
					}
					break;
				case "grid":
					const event_type = body.gridType;
					const page = parseInt(body.gridPage);
					const filter_type = body.filter;
					const query = body.query;
					const size = 10;
					let conditionQuery = helper.convertEventTypeToQueryCondition(event_type, 'event_type');
					// const initConditionQuery = conditionQuery;
					if(filter_type === 'today') {
						const CDT = new Date();
						CDT.setHours(CDT.getHours()-5);
						let day = CDT.getDate();
						day = day < 10 ? '0'+day : day;
						let month = CDT.getMonth()+1;
						month = month < 10 ? '0'+month : month;
						const CDTstr = `${CDT.getFullYear()}-${month}-${day}`;
						conditionQuery += `AND status = 'Active' AND DATE(created_at) = '${CDTstr}'`;
					}
					if(filter_type === 'all') {
						conditionQuery += ` AND status = 'Active'`;
					}
					if(filter_type === 'user') {
						conditionQuery += ` AND status = 'Active' AND user_id = '${body.user_id}'`;
					}
					if(filter_type === 'custom') {
						if(query.status !== "Any") {
							conditionQuery += ` AND status = '${query.status}'`;
						}
						if(query.severity !== "" && query.severity !== "Any") {
							conditionQuery += ` AND severity = '${query.severity}'`;
						}
						if(query.startDate) {
							conditionQuery += ` AND created_at >= '${query.startDate}'`;
						}
						if(query.endDate) {
							conditionQuery += ` AND created_at < '${query.endDate}'`;
						}
						if(query.source_system) {
							conditionQuery += ` AND source_system LIKE '%${query.source_system}%'`;
						}
						if(query.event_id) {
							conditionQuery += ` AND event_id LIKE '%${query.event_id}%'`;
						}
						if(query.description) {
							conditionQuery += ` AND description LIKE '%${query.description}%'`;
						}
					}
					// conditionQuery += ` AND tenant_name = '${this.tenant_name}'`;
					conditionQuery += ` AND tenant_name = '${DB_TENANT}'`;
					// conditionQuery += otherUser ? ` AND tenant_id = '${user.tenant_id}'` : '';
					// let total = await awsManager.getMonitoringEventCount(initConditionQuery);
					let total = await getMonitoringEventCount(dbHelper, conditionQuery);
					conditionQuery += ` ORDER BY created_at DESC LIMIT ${(page-1)*size},${size}`;
					let events = await getMonitoringEvents(dbHelper, conditionQuery);
					if (events) {
						let resp = {
							events,
							total
						};
						await helper.sendMessageToClient(callbackUrlForAWS, connectionId, resp)
						.catch( (e) => {/* this.log.error(`WEBSOCKET SEND MESSAGE ERROR FOR ${soc.conn_id}: `, e) */});
					} else {
						await helper.sendMessageToClient(callbackUrlForAWS, connectionId, {message: 'Monitoring events could not be fetched.'})
						.catch( (e) => {/* this.log.error(`WEBSOCKET SEND MESSAGE ERROR FOR ${soc.conn_id}: `, e) */});
					}
					break;
				case "heartbeats":
					const beats = await getHeartbeats(dbHelper);
					if (beats) {
						let resp = {
							beats,
						};
						await helper.sendMessageToClient(callbackUrlForAWS, connectionId, resp)
						.catch( (e) => {/* this.log.error(`WEBSOCKET SEND MESSAGE ERROR FOR ${soc.conn_id}: `, e) */});
					} else {
						await helper.sendMessageToClient(callbackUrlForAWS, connectionId, {message: 'Heartbeats could not be fetched.'})
						.catch( (e) => {/* this.log.error(`WEBSOCKET SEND MESSAGE ERROR FOR ${soc.conn_id}: `, e) */});
					}
					break;
				default:
					break;
			}
			dbHelper.conn.end();
        } catch(e) {
            this.log.error("Websocket event Error: ", e);
        }
    }
}

exports.handler = async (event, context, callback) => {
    return await new EventsWebsocket().handler(event, context, callback);
};