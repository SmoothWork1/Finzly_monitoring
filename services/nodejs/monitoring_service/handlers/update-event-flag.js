const responseHandler = require('/opt/modules/common/response');
const BaseHandler = require('/opt/modules/common/basehandler');
const utils = require('/opt/modules/common/utils');
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { updateFlaggedEvent, getMonitoringUserByID, updateFlaggedEventWithQuery } = require('./helper/sql-monitoring.js');
const { STAGE } = process.env;

class Update_Event_Flag extends BaseHandler {
    // this is main function
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            let body = event.body ? JSON.parse(event.body) : event;
            let awsManager = new awsmanager();
            await utils.validate(body, helper.get_update_flagged_event_schema());
            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);
            const user = await getMonitoringUserByID(dbHelper, this.user_id);
            if(user.type === 'Other User' && (this.tenant_name != user.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            const flagged = await updateFlaggedEventWithQuery(dbHelper, {
                last_updated_by: body.user_id,
                description_substring: body.description_substring,
            }, user.type === 'Other User' ?
                `flagged_id = '${body.flagged_id}' AND (tenant_id = '${user.tenant_id}' OR tenant_id = 'finzly')`
            :
                `flagged_id = '${body.flagged_id}'`
            );
            // const flagged = await updateFlaggedEvent(dbHelper,/* this.tenant_name, */ {
            //     last_updated_by: body.user_id,
            //     description_substring: body.description_substring,
            // }, body.flagged_id);
            dbHelper.conn.end();
            this.log.info("Event flag updated: ", flagged);
            if (flagged) {
                let resp = {
                    message: "Event flag updated successfully"
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Event flag could not be updated.'});
            }
        } catch(e) {
            this.log.error("Event flag update error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Event flag could not be updated.'});
        }
    }
}

exports.update_event_flag = async(event, context, callback) => {
    return await new Update_Event_Flag().handler(event, context, callback);
};