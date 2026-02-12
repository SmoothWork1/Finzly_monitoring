module.exports =  async function (awsmanager){
    awsmanager.prototype.startExecution = async function(stateMachineArn, input) {
    try {
        let params = {
            stateMachineArn: stateMachineArn,
            input: input
        };
        return this.stepfunction.startExecution(params).promise();
        } catch (err) {
            this.log.error(err);
        }
    };
    awsmanager.prototype.sendTaskSuccess = async function(params) {
        try {
            return this.stepfunction.sendTaskSuccess(params).promise();
            } catch (err) {
                this.log.error(err);
            }
        };
}
