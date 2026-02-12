module.exports = async function (awsmanager) {
	awsmanager.prototype.assumeRole = async function(roleArn) {
		const params = {
			RoleArn: roleArn,
    		RoleSessionName: 'CrossAccountCredentials',
    		ExternalId: '1234567-1234-1234-1234-123456789012',
    		DurationSeconds: 900,
		};
		const assumedrole = await this.sts.assumeRole(params).promise();
		return assumedrole;
	};
}