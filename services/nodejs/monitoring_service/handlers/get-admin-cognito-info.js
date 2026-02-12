const responseHandler = require('/opt/modules/common/response');
const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const helper = require('./helper/helper');
const { getMonitoringUserByID } = require('./helper/sql-monitoring');
const { STAGE } = process.env;

class Get_Admin_Cognito_Info extends BaseHandler {
    //this is main function 
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            // let userid = event.pathParameters.userid;
            let userid = this.user_id;
            const tenant_name = this.tenant_name;
            if(!userid) {
                return responseHandler.sendBadReqResponse({message: 'Invalid request.'});
            }
            let awsManager = new awsmanager();
            const dbHelper = await helper.create_db_connection(STAGE, tenant_name, awsManager);
            let admin = await getMonitoringUserByID(dbHelper, userid);
            if(admin.type === 'Other User' && (this.tenant_name != admin.tenant_id)) {
                return responseHandler.sendUnauthorizedResponse({message: 'User is not unauthorized.'});
            }

            try{
                dbHelper.conn.end();
            }catch(ex){
                console.log(ex);
            }
            
            //dbHelper.closeConn();
            if (!admin) {
                return responseHandler.sendBadReqResponse({message: 'Invalid credentials'});
            }

            let resp = {
                id: admin.id,
                email: admin.email,
                first_name: admin.first_name,
                last_name: admin.last_name,
                contact_number: admin.contact_number,
                address: admin.address,
                type: admin.type,
                devops_type: admin.devops_type,
            };
            // this.log.debug(resp);
            return responseHandler.sendSuccessResponse(resp);
        } catch(e) {
            this.log.error("Get admin profile error: ", e);
            return responseHandler.sendBadReqResponse({message: 'Admin profile could not be fetched.'});
        }
    }
}

exports.get_admin_cognito_info = async (event, context, callback) => {
    return await new Get_Admin_Cognito_Info().handler(event, context, callback);
};