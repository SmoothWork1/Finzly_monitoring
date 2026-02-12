import { Auth } from "aws-amplify";
import { configure } from './amplify';

export const cognitoLoginUser = async (email, password) => {
	await configure();
	return Auth.signIn(email, password);
}

export const cognitoVerifyUser = async (email, code) => {
	await configure();
	return Auth.confirmSignUp(email, code);
}

export const cognitoForgotPassword = async (email) => {
	await configure();
	return Auth.forgotPassword(email);
}

export const cognitoForgotPasswordSubmit = async (email, code, password) => {
	await configure();
	return Auth.forgotPasswordSubmit(email, code, password);
}

export const cognitoGetUser = async () => {
	return Auth.currentUserInfo();
}