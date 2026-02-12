const responseHandler = require('/opt/modules/common/response');
const BaseHandler = require('/opt/modules/common/basehandler');
const utils = require('/opt/modules/common/utils');
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, saveEvent } = require('./helper/sql-monitoring.js');
const { STAGE, DB_TENANT } = process.env;

class Create_Event extends BaseHandler {
    // this is main function
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            let body = event.body ? JSON.parse(event.body) : event;
            const tenant_name = DB_TENANT;
            let awsManager = new awsmanager();
            await utils.validate(body, helper.get_create_event_schema());
            const dbHelper = await helper.create_db_connection(STAGE, tenant_name, awsManager);

            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            const evt = await saveEvent(dbHelper,/* tenant_name, */ {
                name: body.name,
                configuration: body.configuration,
                application: body.application,
                platform: body.platform,
                event_type: body.event_type,
            });
            dbHelper.conn.end();
            this.log.info("Event added: ", evt);
            if (evt) {
                let resp = {
                    message: "Event has been added successfully"
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Event could not be added.'});
            }
        } catch(e) {
            this.log.error("Add Event error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Event could not be added.'});
        }
    }
}

exports.create_event = async(event, context, callback) => {
    return await new Create_Event().handler(event, context, callback);
};