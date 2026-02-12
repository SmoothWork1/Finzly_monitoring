const responseHandler = require('/opt/modules/common/response');
const BaseHandler = require('/opt/modules/common/basehandler');
const utils = require('/opt/modules/common/utils');
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper.js');
const { getMonitoringUserByID, saveMonitoringUser } = require('./helper/sql-monitoring.js');
const { cognito_client, STAGE, DB_TENANT } = process.env;

class Create_User extends BaseHandler {
    // this is main function
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            let body = event.body ? JSON.parse(event.body) : event;
            
            const tenant_name = DB_TENANT;
            let awsManager = new awsmanager();
            await utils.validate(body, helper.get_create_user_schema());
            const dbHelper = await helper.create_db_connection(STAGE, tenant_name, awsManager);
            
            const user_record = await getMonitoringUserByID(dbHelper, this.user_id)
            if(user_record.type === 'Other User' && (this.tenant_name != user_record.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            const user = await saveMonitoringUser(dbHelper,/* tenant_name, */ {
                first_name: body.first_name,
                last_name: body.last_name,
                email: body.email,
                contact_number: body.contact_number,
                address: body.address,
                type: body.type,
                devops_type: body.devops_type,
                tenant_id: body.tenant_id,
            });
            dbHelper.conn.end();
            this.log.info("User added: ", user);
            await awsManager.addUserToCognito(cognito_client, {...body, id: user.id}, 'admin');
            if (user) {
                let resp = {
                    message: "User has been added successfully"
                };
                return responseHandler.sendSuccessResponse(resp);
            } else {
                return responseHandler.sendBadReqResponse({message: 'User could not be added.'});
            }
        } catch(e) {
            this.log.error("Add User error: ", e);
            return responseHandler.sendBadReqResponse({message: 'User could not be added.'});
        }
    }
}

exports.create_user = async(event, context, callback) => {
    return await new Create_User().handler(event, context, callback);
};