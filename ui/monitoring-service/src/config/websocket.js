import WebSocket from 'isomorphic-ws';
import { /* increaseCount, */ saveList, unshiftList } from 'actions/lists';
import { getCleanedDateTime, safelyParseJSONObj } from 'config/helpers';
import { changePreloader } from 'store/actions';
import store from 'store';

let isOpen = false;
const WS_URL = process.env.REACT_APP_WEBSOCKET_URL; 
let websocket = new WebSocket(WS_URL);
// websocket.onopen = onConnOpen;
// websocket.onmessage = onMessage;
// websocket.onclose = onConnClose;
const audio = new Audio('/audio/alertBell.wav');

export const initSocket = async (rootCb, user_id/* , play */) => {
	websocket = new WebSocket(WS_URL);
	websocket.onopen = () => {onConnOpen(user_id);};
	websocket.onmessage = (data) => {
		const res = safelyParseJSONObj(data.data);
		rootCb(res);
		if(res.new && !res.update/*  || res.newBeat */) {
			audio.play();
		}
	};
	websocket.onclose = () => {
		const state = store.getState();
		// console.log(state);
		if(state.session.userid) {
			createSocket(state.session.userid/* , play */);
		} else {
			onConnClose(user_id);
		}
	};
}

export const onConnOpen = (user_id) => {
    isOpen = true;
    console.log('Websocket connected!');
    sendMessage('initiate', {user_id});
}
export const onConnClose = () => {
    isOpen = false;
    console.log('Websocket closed!');
}
export const sendMessage = (routeKey, data) => {    
    if(websocket && isOpen) {
		websocket.send(JSON.stringify({
		// rcaction: routeKey,
		// rcmsg: JSON.stringify(message),
		route: routeKey,
		...data,
		// routemsg: JSON.stringify(message),
		// action: routeKey,
		// data: JSON.stringify(message)
		}));
		return false;
    } else {
		console.log(`Websocket connection not found`);
		return true;
    }    
}

// export const onMessage = (data) => {
//     if (data) {
// 		const message = JSON.parse(data.data);
// 		console.log("MESSAGE:", message);
//     }
// }

export const closeWebsocketConn = (user_id) => {
  if(websocket && isOpen) {
    sendMessage('cease', {user_id});
    websocket.close();
  }
}

export const createSocket = async (user_id/* , play */) => {
	await initSocket((res/* , play */) => {
		if (res) {
			store.dispatch(changePreloader(false));
			// const res = JSON.parse(data.data);
			if(res.new) {
				const newEvent = res.new;
				// if(newEvent.status === "Ignored") {
				// 	store.dispatch(unshiftList(res.new, 'ignored'));
				// } // dash
				if(newEvent.status === "Active") {
					// store.dispatch(unshiftList(res.new, 'active'));
					if(res.new.event_type !== 'RUNTIME_EXCEPTIONS') {
						// store.dispatch(unshiftList(res.new, 'notifications'));
						sendMessage('events', {actionPack: 'notifications', user_id});
					}
					// if(!res.update) {
					// 	store.dispatch(increaseCount(res.new));
					// }
					sendMessage('events', {actionPack: 'event_counts', user_id});
					sendMessage('events', {actionPack: 'blocks', user_id});
					sendMessage('events', {actionPack: 'dashboard', user_id});
				} // counts, dash, notifs
				// grid+filter
				// play();
			}
			if(res.dailyReset) {
				sendMessage('events', {actionPack: 'event_counts', user_id});
				sendMessage('events', {actionPack: 'blocks', user_id});
				sendMessage('events', {actionPack: 'notifications', user_id});
				sendMessage('events', {actionPack: 'heartbeats'});
				sendMessage('events', {actionPack: 'dashboard', user_id});
			}
			if(res.updateReset) {
				sendMessage('events', {actionPack: 'event_counts', user_id});
				sendMessage('events', {actionPack: 'blocks', user_id});
				sendMessage('events', {actionPack: 'notifications', user_id});
				sendMessage('events', {actionPack: 'dashboard', user_id});
			}
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
				store.dispatch(saveList({counts: res.counts}));
			}
			if(res.blocks) {
				store.dispatch(saveList({blocks: res.blocks}));
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
				// res["Assigned Active"] = res.userActives.map( (r) => ({
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
			if(res.beats) {
				const beats = res.beats.map( (r) => ({
					...r,
					keyF: `${r.event_id}${r.source_system}`,
					date: new Date(r.executed_on)
				}));
				beats.sort((a, b) =>  a.date - b.date);
				store.dispatch(saveList({beats}));
			}
			if(res.newBeat) {
				sendMessage('events', {actionPack: 'heartbeats'});
			}
		}
	}, user_id/* , play */);
}