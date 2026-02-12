import { API, Auth, Amplify } from 'aws-amplify';
import config from './amplifyConfig';
// Amplify.Logger.LOG_LEVEL = 'DEBUG';

export async function configure() {
    let basicConfiguration = getBasicConfiguration();
    Amplify.configure(basicConfiguration);
    Auth.configure();
    API.configure();
    return;
}

function getBasicConfiguration() {
    var userPoolId = config.user.userPoolId;
    var userPoolWebClientId = config.user.userPoolClientId;
    var region = config.user.userPoolRegion;
    var identityPoolId = config.user.identityPoolId;

    return {
        API: {
            endpoints: config.apiGateway.URLs
        },
        Auth: {
            identityPoolId,
            region,
            userPoolId,
            userPoolWebClientId,
            mandatorySignIn: true,
            authenticationFlowType: 'USER_PASSWORD_AUTH',
        }
    }
}