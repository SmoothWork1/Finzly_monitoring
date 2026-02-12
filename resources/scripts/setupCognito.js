let adminPermissions = JSON.stringify(require('./adminPermissions.json'));
let rolePolicy = JSON.stringify(require('./rolePolicy.json'));
const variables = require('./setupVariablesProd.json');

const setupCognito = async () => {
	const AWS = require('aws-sdk');
	AWS.config.region = variables.aws.region;
	const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
	console.log("Started User Pool creation...");
	try {
		// user pool
		let poolParams = {
			PoolName: variables.cognito.userPool.name,
			/* required */
			AutoVerifiedAttributes: [
				"email"
			],
			"Schema": [
				{
					"AttributeDataType": "String",
					"Mutable": true,
					"Name": "role",
				},
				{
					"AttributeDataType": "String",
					"Mutable": true,
					"Name": "tenant_name",
				},
				{
					"AttributeDataType": "String",
					"Mutable": true,
					"Name": "userid",
				}
			]
		};
		const userpool = await cognitoidentityserviceprovider.createUserPool(poolParams).promise();
		const poolid = userpool.UserPool.Id;
		console.log("User Pool ID: ", poolid);

		// user pool client
		console.log("started userpool client creation...");
		let clientParams = {
			"ClientName": variables.cognito.userPoolClient.name,
			/* required */
			"UserPoolId": poolid,
			/* required */
			"ExplicitAuthFlows": [
				"ALLOW_CUSTOM_AUTH",
				"ALLOW_USER_PASSWORD_AUTH",
				"ALLOW_USER_SRP_AUTH",
				"ALLOW_REFRESH_TOKEN_AUTH",
			],
			"GenerateSecret": false,
			"RefreshTokenValidity": 30,
		};
		let userpoolclient = await cognitoidentityserviceprovider.createUserPoolClient(clientParams).promise();
		const userClientId = userpoolclient.UserPoolClient.ClientId;
		console.log("User Pool Client ID: ", userpoolclient);

		const providerName = "cognito-idp." + poolid.split("_")[0] + ".amazonaws.com/" + poolid;
		const cognitoidentity = new AWS.CognitoIdentity();
		// identity pool
		var idParams = {
			AllowUnauthenticatedIdentities: false,
			IdentityPoolName: variables.cognito.identityPool.name,
			AllowClassicFlow: false,
			CognitoIdentityProviders: [
				{
					ClientId: userClientId,
					ProviderName: providerName,
					ServerSideTokenCheck: false
				}
			]
		};
		const idpool = await cognitoidentity.createIdentityPool(idParams).promise();
		const identityPoolId = idpool.IdentityPoolId;
		console.log("Identity Pool: ", idpool);
		
		rolePolicy = rolePolicy.replace(/\{\{identityPool\}\}/gi, identityPoolId);
		const iam = new AWS.IAM();
		// policies
		var cPolicyParams = {
			PolicyDocument: adminPermissions,
			PolicyName: variables.iam.policy.admin,
		};
		const adminPolicy = await iam.createPolicy(cPolicyParams).promise();
		console.log("Admin Policy created: ", adminPolicy);
		// adminPolicy.Arn

		// roles
		var cRoleParams = {
			AssumeRolePolicyDocument: rolePolicy,
			RoleName: variables.iam.role.admin
		};
		const adminRole = await iam.createRole(cRoleParams).promise();
		console.log("Admin Role created: ", adminRole);

		var uRoleParams = {
			AssumeRolePolicyDocument: rolePolicy,
			RoleName: variables.iam.role.unauthenticated
		};
		const unauthenticatedRole = await iam.createRole(uRoleParams).promise();
		console.log("Unauthenticated Role created: ", unauthenticatedRole);

		// attach policies to rules
		var cprParams = {
			PolicyArn: adminPolicy.Policy.Arn,
			RoleName: adminRole.Role.RoleName
		};
		await iam.attachRolePolicy(cprParams).promise();
		console.log("Role Policy Attached");

		// identity pool roles
		var roleMapping = {};
		roleMapping[providerName+":"+userClientId] = {
			Type: 'Rules',
			AmbiguousRoleResolution: 'Deny',
			RulesConfiguration: {
				Rules: [
					{
						Claim: 'custom:role',
						MatchType: 'Equals',
						Value: 'admin',
						RoleARN: adminRole.Role.Arn
					}
				]
			}
		};

		var params = {
			IdentityPoolId: identityPoolId,
			Roles: {
				'authenticated': adminRole.Arn,
				'unauthenticated': unauthenticatedRole.Arn
			},
			RoleMappings: roleMapping
		};

		await cognitoidentity.setIdentityPoolRoles(params).promise();
		console.log("Identity Pool Roles set");
	}catch (cupE) {
		console.error("Cognito Error", cupE);
	}
}

if(require?.main === module) {
	setupCognito();
} else {
	module.exports = {setupCognito};
}