const BaseHandler = require('/opt/modules/common/basehandler');
const responseHelper = require('/opt/modules/common/response');
const utils = require('/opt/modules/common/utils');
const helper = require('./helper/helper.js');
const AWS = require("aws-sdk");
const awsmanager = require('/opt/modules/common/awsmanager');
const { CROSSACCOUNT_ID, CROSSACCOUNT_ROLE } = process.env;

class UpdateFunctionSchedule extends BaseHandler {
    constructor() {
        super();
    }
    async process(event, context, callback) {
        let message = "Schedule not found";
        const awsManager = new awsmanager();
        /*
        const roleArn = `arn:aws:iam::${CROSSACCOUNT_ID}:role/${CROSSACCOUNT_ROLE}`;
        const assumedRole = await awsManager.assumeRole(roleArn);
        const accessparams = {
            region:'us-east-2',
            accessKeyId: assumedRole.Credentials.AccessKeyId,
            secretAccessKey: assumedRole.Credentials.SecretAccessKey,
            sessionToken: assumedRole.Credentials.SessionToken,
        };
        */
        try {
            let body = JSON.parse(event.body)
            await utils.validate(body, helper.updateFunctionScheduleSchema());

            //const eventBridge = new AWS.EventBridge(accessparams);
            const eventBridge = new AWS.EventBridge();
            let rulesParams = {
                NamePrefix: body.schedulerName
            };
            
            let schedules = await eventBridge.listRules(rulesParams).promise();
            
            if (schedules.Rules.length > 0) {
                let params = {
                  Name: body.schedulerName,
                  ScheduleExpression: body.expression
                };
                console.log(`Expression: ${body.expression}`)
                await eventBridge.putRule(params).promise();
                message = "Successfully updated schedule";
            }             
            return responseHelper.sendSuccessResponse({
                message: message
            });
        } catch (e) {
            this.log.error("Error: ", e);
            return responseHelper.sendBadReqResponse({
                message: "Request has been failed.",
            });
        }
    }
}

exports.update_function_schedule = async (event, context, callback) => {
    return await new UpdateFunctionSchedule().handler(event, context, callback);
};