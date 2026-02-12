module.exports =  async function (awsmanager){
    awsmanager.prototype.invokeLambda = async function(functionName, payload) {
    try {
        let params = {
            FunctionName: functionName,
            InvocationType: "Event",
            Payload: JSON.stringify(payload)
        };
        return this.lambda.invoke(params).promise();
        } catch (err) {
            this.log.error(err);
        }
    };
}
