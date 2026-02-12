import { initSocket } from './config/websocket';
import { saveList } from 'actions/lists';
import { getCleanedDateTime, safelyParseJSONObj } from 'config/helpers';
import { changePreloader } from 'store/actions';
import store from 'store';

export const createSocket = async (user_id) => {
	await initSocket((data) => {
		if (data) {
			store.dispatch(changePreloader(false));
			const res = JSON.parse(data.data);
			if(res.notifications) {
				const notifications = res.notifications.map( (r) => ({
					...r,
					created_atStr: getCleanedDateTime(r.created_at),
					updated_atStr: getCleanedDateTime(r.updated_at),
					created_at: new Date(r.created_at),
					updated_at: new Date(r.updated_at),
					details: safelyParseJSONObj(r.details),
					badgeclass: r.status === "Active" ? 'danger' : (r.status === "Resolved" ? 'success' : 'warning')
				}));
				store.dispatch(saveList({notifications, more: res.more}));
			}
			if(res.counts) {
				saveList({counts: res.counts});
			}
			if(res.events) {
				const events = res.events.map( (r) => ({
					...r,
					created_atStr: getCleanedDateTime(r.created_at),
					updated_atStr: getCleanedDateTime(r.updated_at),
					created_at: new Date(r.created_at),
					updated_at: new Date(r.updated_at),
					details: safelyParseJSONObj(r.details),
					badgeclass: r.status === "Active" ? 'danger' : (r.status === "Resolved" ? 'success' : 'warning'),
					menu: false
				}));
				store.dispatch(saveList({events, total: res.total}));
			}
			if(res.active && res.ignored && res.resolved && res.userActives) {
				res.active = res.active.map( (r) => ({
					...r,
					created_atStr: getCleanedDateTime(r.created_at),
					updated_atStr: getCleanedDateTime(r.updated_at),
					created_at: new Date(r.created_at),
					updated_at: new Date(r.updated_at),
					details: safelyParseJSONObj(r.details),
					badgeclass: r.status === "Active" ? 'danger' : (r.status === "Resolved" ? 'success' : 'warning')
				}));
				res.ignored = res.ignored.map( (r) => ({
					...r,
					created_atStr: getCleanedDateTime(r.created_at),
					updated_atStr: getCleanedDateTime(r.updated_at),
					created_at: new Date(r.created_at),
					updated_at: new Date(r.updated_at),
					details: safelyParseJSONObj(r.details),
					badgeclass: r.status === "Active" ? 'danger' : (r.status === "Resolved" ? 'success' : 'warning')
				}));
				res.resolved = res.resolved.map( (r) => ({
					...r,
					created_atStr: getCleanedDateTime(r.created_at),
					updated_atStr: getCleanedDateTime(r.updated_at),
					created_at: new Date(r.created_at),
					updated_at: new Date(r.updated_at),
					details: safelyParseJSONObj(r.details),
					badgeclass: r.status === "Active" ? 'danger' : (r.status === "Resolved" ? 'success' : 'warning')
				}));
				// res.["Assigned Active"] = res.userActives.map( (r) => ({
				res.userActives = res.userActives.map( (r) => ({
					...r,
					created_atStr: getCleanedDateTime(r.created_at),
					updated_atStr: getCleanedDateTime(r.updated_at),
					created_at: new Date(r.created_at),
					updated_at: new Date(r.updated_at),
					details: safelyParseJSONObj(r.details),
					badgeclass: r.status === "Active" ? 'danger' : (r.status === "Resolved" ? 'success' : 'warning')
				}));
				store.dispatch(saveList({...res, latest: res.active}));
			}
		}
	}, user_id);
}