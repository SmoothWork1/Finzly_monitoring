const responseHandler = require('/opt/modules/common/response');
const BaseHandler = require('/opt/modules/common/basehandler');
const utils = require('/opt/modules/common/utils');
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { insertFlaggedEvent, getMonitoringUserByID } = require('./helper/sql-monitoring.js');
const { STAGE } = process.env;

class Flag_Event extends BaseHandler {
    // this is main function
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            let body = event.body ? JSON.parse(event.body) : event;
            let awsManager = new awsmanager();
            await utils.validate(body, helper.get_flagged_event_schema());
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);
            const user = await getMonitoringUserByID(dbHelper, this.user_id);
            if(user.type === 'Other User' && (this.tenant_name != user.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            const flagged = await insertFlaggedEvent(dbHelper,/* this.tenant_name, */ {
                created_by: body.user_id,
                description_substring: body.description_substring,
                tenant_id: user.tenant_id
            });
            dbHelper.conn.end();
            this.log.info("Event flagged: ", flagged);
            if (flagged) {
                let resp = {
                    message: "Event flagged successfully"
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Event could not be flagged.'});
            }
        } catch(e) {
            this.log.error("Flag Event Error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Event could not be flagged.'});
        }
    }
}

exports.flag_event = async(event, context, callback) => {
    return await new Flag_Event().handler(event, context, callback);
};