const BaseHandler = require('/opt/modules/common/basehandler');
const responseHelper = require('/opt/modules/common/response');
const utils = require('/opt/modules/common/utils');
const helper = require('./helper/helper.js');
const AWS = require("aws-sdk");
const awsmanager = require('/opt/modules/common/awsmanager');
const { CROSSACCOUNT_ID, CROSSACCOUNT_ROLE } = process.env;

class GetFunctionSchedules extends BaseHandler {
    constructor() {
        super();
    }
    async process(event, context, callback) {
        try {
            const awsManager = new awsmanager();
            /*const roleArn = `arn:aws:iam::${CROSSACCOUNT_ID}:role/${CROSSACCOUNT_ROLE}`;
            const assumedRole = await awsManager.assumeRole(roleArn);
            const accessparams = {
                region:'us-east-2',
                accessKeyId: assumedRole.Credentials.AccessKeyId,
                secretAccessKey: assumedRole.Credentials.SecretAccessKey,
                sessionToken: assumedRole.Credentials.SessionToken,
            };

            const eventBridge = new AWS.EventBridge(accessparams);
            */
            const eventBridge = new AWS.EventBridge({region:'us-east-2'});
            await utils.validate(event.pathParameters, helper.getFunctionSchedulesSchema());
            
            let functionArn = event.pathParameters.functionArn;
            let schedulerDetails = [];
            var rulesParams = {
                TargetArn: functionArn
            };
            
            let ruleNames = await eventBridge.listRuleNamesByTarget(rulesParams).promise();
            ruleNames = ruleNames.RuleNames;
            
            for (const rule of ruleNames) {
                let rulesParams = {
                NamePrefix: rule
                };
            
                let schedules = await eventBridge.listRules(rulesParams).promise();
                if (schedules.Rules.length > 0) {
                    schedulerDetails.push({
                    name: schedules.Rules[0].Name,
                    scheduleExpression: schedules.Rules[0].ScheduleExpression
                    })
                }
            }
            
            return responseHelper.sendSuccessResponse({
                message: schedulerDetails.length > 0 ? "Successfully found schedule(s)" : "No schedule(s) found",
                scheduler: schedulerDetails
            });
        }
        catch (e) {
            this.log.error("Error: ", e);
            return responseHelper.sendServerErrorResponse({
                message: "Request has been failed.",
                scheduler: []
            });
        }
    }
}

exports.get_function_schedules = async (event, context, callback) => {
    return await new GetFunctionSchedules().handler(event, context, callback);
};