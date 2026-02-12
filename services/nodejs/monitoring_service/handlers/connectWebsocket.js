const BaseHandler = require('/opt/modules/common/basehandler');
// const util = require('util');
const { STAGE } = process.env;
const helper = require('./helper/helper');
const awsmanager = require('/opt/modules/common/awsmanager');
const { updateUserSocketConnection } = require('./helper/sql-monitoring');
const { DB_TENANT } = process.env;

class ConnectWebsocket extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            console.log("CONNECT WEBSOCKET REQUEST: ", event);
            let body = event.body ? JSON.parse(event.body) : event;
            // const domain = event.requestContext.domainName;
            // const stage = event.requestContext.stage;
            const connectionId = event.requestContext.connectionId;
            // const callbackUrlForAWS = util.format(util.format('https://%s/%s', domain, stage)); //construct the needed url
            const awsManager = new awsmanager();
			const dbHelper = await helper.create_db_connection(STAGE, DB_TENANT, awsManager);
			const unchecked_confirmation = await updateUserSocketConnection(dbHelper, {
                conn_id: connectionId,
                online: true
            }, {id: body.user_id});
            dbHelper.conn.end();
			// if(unchecked_confirmation) {
			// 	await helper.sendMessageToClient(callbackUrlForAWS, connectionId, {});
			// }
        } catch(e) {
            this.log.error("Websocket connect Error: ", e);
        }
    }
}

exports.handler = async (event, context, callback) => {
    return await new ConnectWebsocket().handler(event, context, callback);
};