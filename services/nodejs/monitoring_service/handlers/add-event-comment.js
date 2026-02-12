const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, saveMonitoringComment } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class AddEventComment extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            // this.log.debug(event);
            let body = event.body ? JSON.parse(event.body) : event;
            let awsManager = new awsmanager();
            if(!body.comment || !body.event_id) {
                return responseHandler.sendBadReqResponse({message: 'Invalid request.'});
            }

            const dbHelper = await helper.create_db_connection(STAGE, this.tenant_name, awsManager);
            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }
            
            let eventComment = await saveMonitoringComment(dbHelper, {
                event_id: body.event_id,
                comment: body.comment,
                user_id: this.user_id
            });
            dbHelper.conn.end();
            if (eventComment.affectedRows) {
                let resp = {
                    // event: monitoringEvent,
                    message: 'Monitoring event comment added successfully'
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Monitoring event comment could not be updated.'});
            }
        } catch(e) {
            this.log.error("Add comment error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Comment could not be added.'});
        }
    }
}

exports.add_event_comment = async(event, context, callback) => {
    return await new AddEventComment().handler(event, context, callback);
};