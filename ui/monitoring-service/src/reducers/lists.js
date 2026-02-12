import { dbTypeToUIType } from 'config/globals';
import { INCREASE_COUNT, SAVE_LIST, UNSHIFT_LIST } from '../actions/types';

const initialState = {
	// Dashboard - Tabs
	totals: [],
	active: [],
	ignored: [],
	resolved: [],

	// Dashboard - Events Assigned to User
	userActives: [],
	userResolved: [],

	// Block Dashboard
	blocks: {},

	// Notifications
	notifications: [],
	more: false,

	// Sidebar Counts
	counts: {},

	// Grid
	events: [],
	total: 0,

	// Heartbeats
	beats: []
};

const listReducer = (state, action) => {
	if(!state) {return initialState;}
	
	switch(action.type) {
		case SAVE_LIST:
			return {
				...state,
				...action.data
			};
		case INCREASE_COUNT:
			const uiType = dbTypeToUIType[action.data.event_type]
			const newCounts = {
				...state.counts,
				[uiType]: (state.counts[uiType] || 0) + 1
			}
			return {
				...state,
				counts: newCounts
			};
		case UNSHIFT_LIST:
			if(action.key === 'notifications' && state.notifications.length > 8) {
				return {
					...state,
					notifications: [action.data, ...state.notifications],
					more: true
				};
			}
			if(action.key === 'active') {
				const newTotals = {...state.totals, Active: state.totals.Active + 1};
				return {
					...state,
					[action.key]: [action.data, ...state[action.key]],
					totals: newTotals
				};
			}
			if(action.key === 'ignored') {
				const newTotals = {...state.totals, Ignored: state.totals.Ignored + 1};
				return {
					...state,
					[action.key]: [action.data, ...state[action.key]],
					totals: newTotals
				};
			}
			return {
				...state,
				[action.key]: [action.data, ...state[action.key]]
			};
		default:
			return state;
	}
};

export default listReducer;