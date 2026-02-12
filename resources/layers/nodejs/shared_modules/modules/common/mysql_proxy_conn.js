const mysql = require('mysql2');
const AWS = require('aws-sdk');
const proxy_connector = async (awsmanager,TENANT_ID,STAGE) => {
	try {
		console.log(`Getting connection for tenant:${TENANT_ID} on Stage:${STAGE}`);
	
		const proxy_host = `/config/bankos/global_${STAGE}/bankos.tenant.${TENANT_ID}.db.proxy.host`;
		const proxy_port = `/config/bankos/global_${STAGE}/bankos.tenant.${TENANT_ID}.db.proxy.port`;
		const proxy_user = `/config/bankos/global_${STAGE}/bankos.tenant.${TENANT_ID}.db.proxy.user`;
		let requiredParams = [proxy_host,proxy_port,proxy_user];
		//console.log(`Fetching db proxy parameters from parameter store`);
		//console.log(requiredParams);
		const paramsFormStore = await awsmanager.getStoreParameters(requiredParams);
		const params = await awsmanager.objectifyParams(paramsFormStore);
		const DB_USER = params[proxy_user];
		const DB_HOST = params[proxy_host];
		const DB_PORT = parseInt(params[proxy_port]);
		//console.log(`db_host:${DB_HOST},db_user:${DB_USER},db_port:${DB_PORT}`);
		var signer = new AWS.RDS.Signer({
			region: process.env.REGION, // example: us-east-2
			hostname: DB_HOST,//'[insert your RDS Proxy endpoint here]',
			port: DB_PORT,
			username: DB_USER //'[Your RDS User name]'
		});
		let token = signer.getAuthToken({
			username: DB_USER//'[Your RDS User name]'
		});
		//console.log ("IAM Token obtained to assume role to connect to DB\n");
		//console.log(token);
		let connectionConfig = {
			host: DB_HOST, // Store your endpoint as an env var
			user: DB_USER,
			//database: DB_NAME, // Store your DB schema name as an env var
			ssl: { rejectUnauthorized: false},
			password: token,
			authSwitchHandler: function ({pluginName, pluginData}, cb) {
				//console.log("Setting new auth handler.");
			}
		};
		// Adding the mysql_clear_password handler
		connectionConfig.authSwitchHandler = (data, cb) => {
			if (data.pluginName === 'mysql_clear_password') {
			// See https://dev.mysql.com/doc/internals/en/clear-text-authentication.html
			//console.log("pluginName: "+data.pluginName);
			let password = token + '\0';
			let buffer = Buffer.from(password);
			cb(null, password);
			}
		};
		const conn = mysql.createConnection(connectionConfig);
		conn.connect(function(err) {
			if (err) {
				console.log('error connecting: ' + err.stack);
				return;
			}   
			//console.log('connected as id ' + conn.threadId + "\n");
		 });
		return conn;
	}catch(ex){
		console.log(ex);
		throw new Error(`Failed to open connection. Please make sure you have db properties defined in parameter store`);
	}
};

module.exports = proxy_connector;