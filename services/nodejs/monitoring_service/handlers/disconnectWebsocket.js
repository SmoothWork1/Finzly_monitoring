const BaseHandler = require('/opt/modules/common/basehandler');
const helper = require('./helper/helper');
const awsmanager = require('/opt/modules/common/awsmanager');
const { updateUserSocketConnection } = require('./helper/sql-monitoring');
const { DB_TENANT } = process.env;

class DisconnectSocket extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            console.log("DISCONNECT WEBSOCKET REQUEST: ", event);
            let body = event.body ? JSON.parse(event.body) : event;
            const connectionId = event.requestContext.connectionId;
            const awsManager = new awsmanager();
			const dbHelper = await helper.create_db_connection(STAGE, DB_TENANT, awsManager);
            await updateUserSocketConnection(dbHelper, {
				conn_id: null,
				online: false
			}, {
				conn_id: connectionId,
				id: body.user_id
			});
            dbHelper.conn.end();
            // const sockets = await dbHelper.select(`poc_websocket`, '*');
            // await sendMessageToClient(callbackUrlForAWS, connectionId, {sockets});
        } catch(e) {
            this.log.error("Websocket disconnect Error: ", e);
        }
    }
}

exports.handler = async (event, context, callback) => {
    return await new DisconnectSocket().handler(event, context, callback);
};