const variables = require('./setupVariables.json');

const deployDB = async () => {
	const AWS = require('aws-sdk');
	AWS.config.region = variables.aws.region;
	const rds = new AWS.RDS();

	console.log("Creating Database Instance");
	var params = {
		DBInstanceClass: variables.mysql.instanceClass, /* required */
		DBInstanceIdentifier: variables.mysql.instanceName, /* required */
		Engine: variables.mysql.engine, /* required */
		AllocatedStorage: variables.mysql.instanceGib, // without cluster
		AutoMinorVersionUpgrade: true,
		// BackupRetentionPeriod: 'NUMBER_VALUE',
		// Domain: 'STRING_VALUE',
		// EnableCustomerOwnedIp: true,
		EnablePerformanceInsights: true,
		EngineVersion: variables.mysql.engineVersion,
		DBName: variables.mysql.db_name, // without cluster
		MasterUserPassword: variables.mysql.db_pass, // without cluster
		MasterUsername: variables.mysql.db_user, // without cluster
		Port: variables.mysql.db_port,
		// MaxAllocatedStorage: '20',
		PubliclyAccessible: true,
		DeletionProtection: true, // without cluster
		// StorageEncrypted: true || false,
		StorageType: variables.mysql.storageType
	};
	const dbInstance =  await rds.createDBInstance(params).promise();
	console.log(`Database Instance ${variables.mysql.instanceName} created:`, dbInstance);
}

if(require?.main === module) {
	deployDB();
} else {
	module.exports = {deployDB};
}
