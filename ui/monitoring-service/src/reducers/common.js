import { SET_LOADING } from '../actions/types';

const initialState = {
	loading: false
};

const commonReducer = (state, action) => {
	if(!state) {return initialState;}
	
	switch(action.type) {
		case SET_LOADING:
			return {
				...state,
				loading: action.load
			};
		default:
			return state;
	}
};

export default commonReducer;