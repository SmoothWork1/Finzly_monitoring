import { LOGIN, LOGIN_SAGA, LOGOUT, LOGOUT_SAGA } from './types';

export const login = (data) => ({
	type: LOGIN,
	data
});

export const logout = () => ({
	type: LOGOUT
});

export const loginSaga = (data) => ({
	type: LOGIN_SAGA,
	data
});

export const logoutSaga = () => ({
	type: LOGOUT_SAGA
});