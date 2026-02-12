const responseHandler = require('/opt/modules/common/response');
const BaseHandler = require('/opt/modules/common/basehandler');
const utils = require('/opt/modules/common/utils');
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { saveMonitoringUser } = require('./helper/sql-monitoring.js');
const { cognito_client, STAGE,DB_TENANT } = process.env;

class Admin_Onboarding extends BaseHandler {
    // this is main function
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            let body = event.body ? JSON.parse(event.body) : event;
            const tenant_name = DB_TENANT;
            let awsManager = new awsmanager();
            await utils.validate(body, helper.get_user_schema());
            const dbHelper = await helper.create_db_connection(STAGE, tenant_name, awsManager);
            const user = await saveMonitoringUser(dbHelper,/* tenant_name, */ {
                first_name: body.first_name,
                last_name: body.last_name,
                email: body.email,
                contact_number: body.contact_number,
                address: body.address,
                type: body.type,
                devops_type: body.devops_type,
            });
            dbHelper.conn.end();
            this.log.info("Admin onboard: ", user);
            await awsManager.addUserToCognito(cognito_client, {...body, id: user.id, tenant_name}, 'admin');
            if (user) {
                let resp = {
                    message: "Admin has been registered successfully"
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'Admin could not be registered.'});
            }
        } catch(e) {
            this.log.error("Admin onboarding error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Admin could not be registered.'});
        }
    }
}

exports.admin_onboarding = async(event, context, callback) => {
    return await new Admin_Onboarding().handler(event, context, callback);
};