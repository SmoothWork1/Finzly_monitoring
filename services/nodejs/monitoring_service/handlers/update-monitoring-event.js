const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { STAGE, WEBSOCKET_URL, REGION } = process.env;
const util = require('util');
const { getMonitoringUserByID, updateMonitoringEvent, saveMonitoringComment, getOnlineUsers } = require("./helper/sql-monitoring.js");

class UpdateMonitoringEvent extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            // this.log.debug(event);
            let body = event.body ? JSON.parse(event.body) : event;
            let awsManager = new awsmanager();
            if(!body.status || !body.selectedRows || !body.comment) {
                return responseHandler.sendBadReqResponse({message: 'Invalid request.'});
            }
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            const selectedRows = body.selectedRows;
            let status = true;
            for(let i=0; i<selectedRows.length; i++) {
                let monitoringEvent = await updateMonitoringEvent(dbHelper, /* this.tenant_name, */ {
                    status: body.status,
                    updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    updated_by: this.tenant_name
                }, {event_id: selectedRows[i]});

                if (monitoringEvent.affectedRows) {
                    await saveMonitoringComment(dbHelper, {
                        event_id: selectedRows[i],
                        comment: body.comment,
                        user_id: this.user_id
                    });
                }
                else {
                    status = false;
                }
            }
            if (status) {
                const callbackUrlForAWS = util.format(util.format('https://%s/%s', `${WEBSOCKET_URL}.execute-api.${REGION}.amazonaws.com`, STAGE));
				const sockets = await getOnlineUsers(dbHelper);
                dbHelper.conn.end();
				for(let i = 0; i < sockets.length; ++i) {
					const soc = sockets[i];
					if(soc.online) {
						await helper.sendMessageToClient(callbackUrlForAWS, soc.conn_id, {updateReset: true})
							.catch( (e) => {/* this.log.error(`WEBSOCKET SEND MESSAGE ERROR FOR ${soc.conn_id}: `, e) */});
					}
				}
                let resp = {
                    // event: monitoringEvent,
                    message: 'Monitoring event status updated successfully'
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Monitoring event status could not be updated.'});
            }
        } catch(e) {
            this.log.error("Event update error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Event could not be updated.'});
        }
    }
}

exports.update_monitoring_event = async(event, context, callback) => {
    return await new UpdateMonitoringEvent().handler(event, context, callback);
};