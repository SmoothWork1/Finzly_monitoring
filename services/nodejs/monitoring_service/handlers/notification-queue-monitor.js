const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const utils = require('/opt/modules/common/utils');
const { STAGE, DB_TENANT, NOTIFICATION_API_URL, WEBSOCKET_URL, REGION } = process.env;
const util = require('util');
const { getHeartbeatByKey, updateHeartbeat, insertHeartbeat, getOnlineUsers, getFlaggedEventByDescSubstr, getMonitoringEvents, updateMonitoringEvent, insertMonitoringEvent, getSubscribedEventsByTypeTenant, getSubscribedEventsByType, getMonitoringUserByID, getFlaggedEventByDescSubstrAndTenant } = require("./helper/sql-monitoring.js");

class NotificationQueueMonitor extends BaseHandler {
    constructor() {
        super();
    }
	async emailContent(msgObj){
		const details = msgObj.details != null?JSON.parse(msgObj.details):{"Content":"None"};
		const desc = msgObj.description;
		var body = "";
		body = body.concat("<html>")
		body = body.concat("<body>")
		body = body.concat(`<div><span>${desc}</span></div>`)
		for (const key of Object.keys(details)){
			body = body.concat(`<div><span><b>${key}</b>:${details[key]}</span></div>`)
		}
		body = body.concat("</body>")
		body = body.concat("</html>")
		return body;
	}
    async process(event, context, callback) {
		const awsManager = new awsmanager();
		const schema = helper.get_monitoring_notification_schema();
		const hbSchema = helper.get_heartbeat_notification_schema();
		const dbHelper = await helper.create_db_connection(STAGE, DB_TENANT, awsManager);
        // get Records from event
        const { Records } = event;
		for(let i = 0; i < Records.length; ++i) {
			try {
				const r = Records[i];
				// this.log.info(r.messageAttributes);
				this.log.info(r.body);
				const msgBody = JSON.parse(r.body);
				
				/**		Heartbeat	 */
				if(msgBody.event_type === helper.heartbeatType) {
					await utils.validate(msgBody, hbSchema);
					let beat = await getHeartbeatByKey(dbHelper, msgBody.event_id, msgBody.source_system);
					if(beat) {
						await updateHeartbeat(dbHelper, {
							description: msgBody.description,
							executed_on: msgBody.executed_on,
							tenant_name: msgBody.tenant_name,
						}, {
							event_id: msgBody.event_id.replace(/\'/gi,''),
							source_system: msgBody.source_system,
						});
					} else {
						await insertHeartbeat(dbHelper, {
							description: msgBody.description,
							executed_on: msgBody.executed_on,
							event_id: msgBody.event_id.replace(/\'/gi,''),
							source_system: msgBody.source_system,
							tenant_name: msgBody.tenant_name,
						});
					}
					const callbackUrlForAWS = util.format(util.format('https://%s/%s', `${WEBSOCKET_URL}.execute-api.${REGION}.amazonaws.com`, STAGE));
					const sockets = await getOnlineUsers(dbHelper);
					if(sockets != null){
						for(let i = 0; i < sockets.length; ++i) {
							const soc = sockets[i];
							if(soc.online) {
								await helper.sendMessageToClient(callbackUrlForAWS, soc.conn_id, {newBeat: true})
									.catch( (e) => {/* this.log.error(`WEBSOCKET SEND MESSAGE ERROR FOR ${soc.conn_id}: `, e) */});
							}
						}	
					}
					await awsManager.rmSQSMessage(r.receiptHandle);
					return;
				}
				/**		~Heartbeat	 */
				if(typeof msgBody.details === 'object' && msgBody.details !== null){
					msgBody.details = JSON.stringify(msgBody.details);
				}
				/*else{
					msgBody.details = JSON.stringify({});
				}*/
				await utils.validate(msgBody, schema);
				// await helper.create_db_connection(STAGE, DB_TENANT, awsManager);
				const flagged = await getFlaggedEventByDescSubstr(dbHelper, msgBody.description);
				await getFlaggedEventByDescSubstrAndTenant(dbHelper, msgBody.description, msgBody.tenant_id)
				// const user = await getMonitoringUserByID(dbHelper, this.user_id);
				// const flagged = user.type === 'Other User' ?
				// 	await getFlaggedEventByDescSubstrAndTenant(dbHelper, msgBody.description, user.tenant_id)
				// :
				// 	await getFlaggedEventByDescSubstr(dbHelper, msgBody.description);
				const created_at = new Date();
				created_at.setHours(created_at.getHours()-5);
				const req = {
					// event_id, event_type, source_system, tenant_name, description, details, tenant_id
					...msgBody,
					severity: msgBody.severity || 'high',
					status: flagged ? "Ignored" : "Active",
					created_by: "galaxy-monitoring",
					created_at: created_at.toISOString().slice(0, 19).replace('T', ' ')
				};
				let update = true;
				const existing_events = await getMonitoringEvents(dbHelper, `event_id = '${req.event_id}'`);
				console.log(existing_events);
				let notification = null;
				if(existing_events != null && existing_events.length > 0){
					notification = existing_events[0]
				}
				//let notification = (await getMonitoringEvents(dbHelper, `event_id = '${req.event_id}'`))[0];
				if(notification) {
					// delete req.event_id;
					notification = await updateMonitoringEvent(dbHelper, {
						event_type: msgBody.event_type,
						source_system: msgBody.source_system,
						tenant_name: msgBody.tenant_name,
						description: msgBody.description,
						details: msgBody.details,
						//tenant_id: msgBody.tenant_id,
						severity: msgBody.severity || 'high',
						// ...msgBody,
						status: flagged ? "Ignored" : "Active",
						created_by: "galaxy-monitoring",
						created_at: created_at.toISOString().slice(0, 19).replace('T', ' ')
					}, {event_id: req.event_id});
				} else {
					notification = await insertMonitoringEvent(dbHelper, req);
					update = false;
				}
				const callbackUrlForAWS = util.format(util.format('https://%s/%s', `${WEBSOCKET_URL}.execute-api.${REGION}.amazonaws.com`, STAGE));
				const sockets = await getOnlineUsers(dbHelper);
				for(let i = 0; i < sockets.length; ++i) {
					const soc = sockets[i];
					if(soc.online) {
						await helper.sendMessageToClient(callbackUrlForAWS, soc.conn_id, {new: req, update})
							.catch( (e) => {/* this.log.error(`WEBSOCKET SEND MESSAGE ERROR FOR ${soc.conn_id}: `, e) */});
					}
				}
				if(notification) {
					await awsManager.rmSQSMessage(r.receiptHandle);
					const details = helper.safelyParseJSONObj(msgBody.details);
					let subscriptions;
					if(details.Tenant || details.tenant) {
						subscriptions = await getSubscribedEventsByTypeTenant(dbHelper, req.event_type, details.Tenant || details.tenant);
					} else {
						// fetch event subscriptions by event type
						subscriptions = await getSubscribedEventsByType(dbHelper, req.event_type);
					}
					dbHelper.conn.end();
					// send notification to each user subscribed to event
					const emailSubs = (subscriptions.filter((s) => s.delivery_method === 'email')).map( (s) => s.deliver_to);
					//const b64Desc = Buffer.from(req.description).toString('base64')
					const b64Desc = Buffer.from(await this.emailContent(req)).toString('base64');
					if(emailSubs && emailSubs.length > 0){
						await awsManager.axios.post(NOTIFICATION_API_URL, {
							"tenantName": "finzly",
							"notificationType": "EmailMonitoringAlert",
							"sourceId": req.event_id,
							"sourceType": req.event_type,
							"content": b64Desc,
							"sourceObj": {},
							"moreInfo": {
								adhoc: true,
								subject: `Monitoring Alert - ${req.event_type}`,
								notificationMethod: 'EMAIL',
								to: emailSubs
							}
						},{headers:{
							'x-api-key':'m0mz4w7DdD9OvCc0qAREm5VUdf1yPZ1EanIPzg9K'
						}});
					}
					const smsSubs = (subscriptions.filter((s) => s.delivery_method === 'sms')).map( (s) => s.deliver_to);
					if(smsSubs && smsSubs.length > 0){
						await awsManager.axios.post(NOTIFICATION_API_URL, {
							"tenantName": "finzly",
							"notificationType": "SMSMonitoringAlert",
							"sourceId": req.event_id,
							"sourceType": req.event_type,
							"content": b64Desc,
							"sourceObj": {},
							"moreInfo": {
								adhoc: true,
								subject: 'Monitoring alert',
								notificationMethod: 'PHONE',
								to: smsSubs
							}
						},{headers:{
							'x-api-key':'m0mz4w7DdD9OvCc0qAREm5VUdf1yPZ1EanIPzg9K'
						}});
					}
				} else {
					this.log.error(`Saving monitoring notification to database failed for ${Records[i].body}`);
				}
			} catch(err) {
				this.log.error(`Saving monitoring notification to database failed for ${Records[i].body}: `, err);
			}
		}
		dbHelper.conn.end();
    }
}

exports.notification_queue_monitor = async(event, context, callback) => {
    return await new NotificationQueueMonitor().handler(event, context, callback);
};