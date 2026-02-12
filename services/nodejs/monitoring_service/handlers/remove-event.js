const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const utils = require('/opt/modules/common/utils');
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, removeEventByID } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class Remove_Event extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
			let body = event.body ? JSON.parse(event.body) : event;
            const awsManager = new awsmanager();
            await utils.validate(body, helper.get_remove_event_schema());
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            let evt = await removeEventByID(dbHelper, body.id);
            dbHelper.conn.end();
            if (evt) {
                let resp = {
                    message: "Removed event successfully"
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Event could not be removed.'});
            }
        } catch(e) {
            this.log.error("Remove event error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Could not remove event.'});
        }
    }
}

exports.remove_event = async(event, context, callback) => {
    return await new Remove_Event().handler(event, context, callback);
};