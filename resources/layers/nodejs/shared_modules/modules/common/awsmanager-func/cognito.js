module.exports = async function (awsmanager) {
    awsmanager.prototype.login = async function(clientId, userName, password) {
        try {
            let params = {
                AuthFlow: "USER_PASSWORD_AUTH",
                ClientId: clientId,
                AuthParameters: {
                    'USERNAME': userName,
                    'PASSWORD': password
                }
            };
            return this.cognito.initiateAuth(params).promise();
        } catch (err) {
            this.log.error(err);
        }
        return null;
    };

    awsmanager.prototype.respondToAuthChallange = async function(userName, password, clientID, userpoolID, session){
        try {
            let params = {
				ChallengeName: 'NEW_PASSWORD_REQUIRED', /* required */
				ClientId: clientID, /* required */
				UserPoolId: userpoolID,
				ChallengeResponses: {
					'USERNAME': userName,
					'NEW_PASSWORD':password
				},
				Session: session,
            };
            
            return this.cognito.adminRespondToAuthChallenge(params).promise();
        } catch (err) {
            this.log.error(err);
        }
        return null;
    };

    awsmanager.prototype.addUserToCognito = async function(clientId, user, role) {
        if(!user.username){
            user.username = user.email;
        }
        try {
            let params = {
                ClientId: clientId,
                Username: user.email,
                Password: user.password,
                UserAttributes: [
                    {
                        Name: 'email',
                        Value: user.email
                    },
                    {
                        Name: 'custom:role',
                        Value: role
                    },
                    {
                        Name: 'custom:tenant_name',
                        Value: user.tenant_id
                    },
                    {
                        Name: 'custom:userid',
                        Value: user.id
                    },
                    {
                        Name: 'name',
                        Value: user.first_name+' '+user.last_name
                    }
                ]
            }
            return this.cognito.signUp(params).promise();
        }
        catch (err) {
            this.log.error(err);
        }
        return null;
	};
	
	awsmanager.prototype.deleteUserFromPool = async function(email, user_pool_id) {
        try {
            let params = {
                UserPoolId: user_pool_id,
                Username: email
            };
            await this.cognito.adminDeleteUser(params).promise()
        }
        catch (err) {
            this.log.error(err);
        }
    };

    awsmanager.prototype.confirmSignUp = async function(clientId, confirmationCode, userName) {
        try {
            var params = {
                ClientId: clientId, /* required */
                ConfirmationCode: confirmationCode, /* required */
                Username: userName, /* required */
            };
            return this.cognito.confirmSignUp(params).promise();
        } catch (err) {
            this.log.error(err);
        }
    };

    awsmanager.prototype.forgotPassword = async function(clientId, userName) {
        try {
            var params = {
                ClientId: clientId, /* required */
                Username: userName, /* required */
            };
            return this.cognito.forgotPassword(params).promise();
        } catch (err) {
            this.log.error(err);
        }
    };

    awsmanager.prototype.confirmForgotPassword = async function(clientId, confirmationCode, userName, password) {
        try {
            var params = {
                ClientId: clientId, /* required */
                ConfirmationCode: confirmationCode, /* required */
                Username: userName, /* required */
                Password: password, /* required */
            };
            return this.cognito.confirmForgotPassword(params).promise();
        } catch (err) {
            this.log.error(err);
        }
    };
}