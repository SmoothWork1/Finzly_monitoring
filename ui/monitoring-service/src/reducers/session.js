import { LOGIN, LOGIN_SAGA, LOGOUT, LOGOUT_SAGA } from '../actions/types';

const initialState = {
	userid: undefined,
};

const sessionReducer = (state, action) => {
	if(!state) {return initialState;}

	switch(action.type) {
		case LOGIN:
			return {
				...state,
				...action.data
			};
		case LOGIN_SAGA:
			return {
				...state
			};
		case LOGOUT_SAGA:
			return {
				...state
			};
		case LOGOUT:
			return {
				...state,
				userid: undefined,
			};
		default:
			return state;
	}
};

export default sessionReducer;