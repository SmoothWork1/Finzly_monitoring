const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { STAGE, WEBSOCKET_URL, REGION, DB_TENANT } = process.env;
const util = require('util');
const { getMonitoringUsers, getActiveEvents, getViewedNotifications, notificationViewedByUser } = require("./helper/sql-monitoring.js");

class DailyReset extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
		try {
			const awsManager = new awsmanager();
			const callbackUrlForAWS = util.format(util.format('https://%s/%s', `${WEBSOCKET_URL}.execute-api.${REGION}.amazonaws.com`, STAGE));
			const dbHelper = await helper.create_db_connection(STAGE, DB_TENANT, awsManager);
			// const sockets = await awsManager.getOnlineUsers();
			const sockets = await getMonitoringUsers(dbHelper);
			const events = await getActiveEvents(dbHelper, DB_TENANT, "Active");
			for(let i = 0; i < sockets.length; ++i) {
				const soc = sockets[i];
				const viewed = await getViewedNotifications(dbHelper, soc.id);
				const cleanViewed = viewed.map( (v) => v.event_id );
				const filteredEvents = events.filter( (e) => 
										cleanViewed.indexOf(e.event_id) === -1
										&& e.event_type !== 'RUNTIME_EXCEPTIONS'
									);
				if (filteredEvents) {
					for(let j = 0; j <= filteredEvents.length; ++j) {
						if(j === filteredEvents.length) {
							dbHelper.conn.end();
							if(soc.conn_id && soc.online) {
								await helper.sendMessageToClient(callbackUrlForAWS, soc.conn_id, {dailyReset: true})
									.catch( (e) => {/* this.log.error(`WEBSOCKET SEND MESSAGE ERROR FOR ${soc.conn_id}: `, e) */});
							}
						} else {
							await notificationViewedByUser(dbHelper, soc.id, filteredEvents[j].event_id);
						}
					}
				} else {
					dbHelper.conn.end();
					if(soc.conn_id && soc.online) {
						await helper.sendMessageToClient(callbackUrlForAWS, soc.conn_id, {dailyReset: true})
							.catch( (e) => {/* this.log.error(`WEBSOCKET SEND MESSAGE ERROR FOR ${soc.conn_id}: `, e) */});
					}
				}
			}
		} catch(e) {
			this.log.error("Daily reset error: ", e);
		}
	}
}

exports.daily_reset = async(event, context, callback) => {
    return await new DailyReset().handler(event, context, callback);
};