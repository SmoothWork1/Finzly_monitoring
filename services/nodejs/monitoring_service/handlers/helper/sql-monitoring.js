exports.insertMonitoringEvent = async function(dbHelper, /* obj */event) {
	try {
		// const event_id = utils.generateRandomID(2, 6);
		// const event = {
		// 	...obj,
		// 	event_id
		// };
		const results = await dbHelper.insertWithSet(`galaxy_monitoring.monitoring`, event);
		return results;
	} catch (err) {
		console.error(err);
		throw err;
	}
	// return null;
};
exports.notificationViewedByUser = async function(dbHelper, user_id, event_id) {
	try {
		const results = await dbHelper.insertWithSet(`galaxy_monitoring.user_notifications`, {user_id, event_id});
		return results;
	} catch (err) {
		console.error(err);
		throw err;
	}
	// return null;
};
exports.getViewedNotifications = async function(dbHelper, user_id) {
	try {
		let notifications = await dbHelper.selectWithConditions(`galaxy_monitoring.user_notifications`, '*', {user_id});
		return notifications;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getHeartbeats = async function(dbHelper) {
	try {
		let beats = await dbHelper.select(`galaxy_monitoring.heartbeats`, '*');
		return beats;
	} catch (err) {
		console.error(err);
	}
	return null;
};
// exports.getHeartbeatsByTenant = async function(dbHelper, tenant_name) {
// 	try {
// 		let beats = await dbHelper.select(`galaxy_monitoring.heartbeats`, '*', {tenant_name});
// 		return beats;
// 	} catch (err) {
// 		console.error(err);
// 	}
// 	return null;
// };
exports.getHeartbeatByKey = async function(dbHelper, event_id, source_system) {
	try {
		let beats = await dbHelper.selectWithConditions(`galaxy_monitoring.heartbeats`, '*', {event_id, source_system});
		return beats[0];
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.insertHeartbeat = async function(dbHelper, /* obj */event) {
	try {
		const results = await dbHelper.insertWithSet(`galaxy_monitoring.heartbeats`, event);
		return results;
	} catch (err) {
		console.error(err);
		throw err;
	}
	// return null;
};
exports.updateHeartbeat = async function(dbHelper, obj, key) {
	try {
		const results = await dbHelper.update(`galaxy_monitoring.heartbeats`, obj, key);
		return results;
	} catch (err) {
		console.error(err);
		throw err;
	}
	// return null;
};
exports.getMonitoringEvents = async function(dbHelper, conditionStr) {
	try {
		// let event = await dbHelper.selectWithConditions(`galaxy_monitoring.monitoring`, '*', {event_type, tenant_name});
		// console.info("QUERY: ", `SELECT * FROM galaxy_monitoring.monitoring WHERE ${conditionStr}`);
		let events = await dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, '*', conditionStr);
		return events;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getMonitoringEventFunctionNames = async function(dbHelper, conditionStr) {
	try {
		let functions = await dbHelper.selectWithPreQuery(`galaxy_monitoring.event_function_mapping`, '*', conditionStr);
		return functions;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getMonitoringEventCount = async function(dbHelper, conditionStr) {
	try {
		let event = await dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, 'COUNT(*) AS total', conditionStr);
		return event[0].total;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getScheduledEventCountByType = async function(dbHelper) {
	try {
		let event = await dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, 'COUNT(*) AS count, event_type', `status = 'Active' AND event_type = 'SCHEDULED_MAINTENANCE' GROUP BY event_type`);
		return event;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getTodayEventCountByType = async function(dbHelper) {
	try {
		const CDT = new Date();
		CDT.setHours(CDT.getHours()-5);
		let day = CDT.getDate();
		day = day < 10 ? '0'+day : day;
		let month = CDT.getMonth()+1;
		month = month < 10 ? '0'+month : month;
		const CDTstr = `${CDT.getFullYear()}-${month}-${day}`;
		let event = await dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, 'COUNT(*) AS count, event_type', `DATE(created_at) = '${CDTstr}' AND status = 'Active' AND event_type != 'SCHEDULED_MAINTENANCE' GROUP BY event_type`);
		return event;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getEventCountByType = async function(dbHelper) {
	try {
		let event = await dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, 'COUNT(*) AS count, event_type', `status = 'Active' AND event_type != 'SCHEDULED_MAINTENANCE' GROUP BY event_type`);
		return event;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getEventCountByTypeAndTenant = async function(dbHelper, tenant_id) {
	try {
		let event = await dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, 'COUNT(*) AS count, event_type', `status = 'Active' AND event_type != 'SCHEDULED_MAINTENANCE' AND tenant_name = '${tenant_id}' GROUP BY event_type`);
		return event;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getTodayEventCountByGivenTypes = async function(dbHelper, condQuery) {
	try {
		const CDT = new Date();
		CDT.setHours(CDT.getHours()-5);
		let day = CDT.getDate();
		day = day < 10 ? '0'+day : day;
		let month = CDT.getMonth()+1;
		month = month < 10 ? '0'+month : month;
		const CDTstr = `${CDT.getFullYear()}-${month}-${day}`;
		let event = await dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, 'COUNT(*) AS count, event_type', `DATE(created_at) = '${CDTstr}' AND status = 'Active' AND (${condQuery}) GROUP BY event_type`);
		return event;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getTodayEventsByGivenTypes = async function(dbHelper, condQuery) {
	try {
		const CDT = new Date();
		CDT.setHours(CDT.getHours()-5);
		let day = CDT.getDate();
		day = day < 10 ? '0'+day : day;
		let month = CDT.getMonth()+1;
		month = month < 10 ? '0'+month : month;
		const CDTstr = `${CDT.getFullYear()}-${month}-${day}`;
		let event = await dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, '*', `DATE(created_at) = '${CDTstr}' AND status = 'Active' AND (${condQuery}) ORDER BY created_at DESC`);
		return event;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getActiveEventsByGivenTypes = async function(dbHelper, condQuery) {
	try {
		let event = await dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, '*', `status = 'Active' AND (${condQuery}) ORDER BY created_at DESC`);
		return event;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getMonitoringUsers = async function(dbHelper) {
	try {
		let users = await dbHelper.select(`galaxy_monitoring.users`, '*');
		return users;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getManagableUsers = async function(dbHelper, userid) {
	try {
		let users = await dbHelper.selectWithPreQuery(`galaxy_monitoring.users`, '*', `type <> 'Super Admin' AND id <> '${userid}'`);
		return users;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getRecentEvents = async function(dbHelper, tenant_name, status) {
	try {
		let event = await dbHelper.conditionalSelectWithOrder(`galaxy_monitoring.monitoring`, '*', {status}, 'created_at DESC', '10');
		return event;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getRecentEventsByTenant = async function(dbHelper, tenant_name, status, tenant_id) {
	try {
		let event = await dbHelper.conditionalSelectWithOrder(`galaxy_monitoring.monitoring`, '*', {status:status, tenant_name:tenant_id}, 'created_at DESC', '10');
		return event;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getActiveEvents = async function(dbHelper, tenant_name, status) {
	try {
		let event = await dbHelper.selectWithConditions(`galaxy_monitoring.monitoring`, '*', {status});
		return event;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getActiveEventsByTenant = async function(dbHelper, tenant_name, status, tenant_id) {
	try {
		let event = await dbHelper.selectWithConditions(`galaxy_monitoring.monitoring`, '*', {status:status, tenant_name:tenant_id});
		return event;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getDashboardTotals = async function(dbHelper, tenant_name) {
	try {
		let statuses = await dbHelper.query(`SELECT COUNT(*) AS total, status FROM galaxy_monitoring.monitoring GROUP BY status`);
		return statuses;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getDashboardTotalsByTenant = async function(dbHelper, tenant_name, tenant_id) {
	try {
		let statuses = await dbHelper.query(`SELECT COUNT(*) AS total, status FROM galaxy_monitoring.monitoring WHERE tenant_name = '${tenant_id}' GROUP BY status`);
		return statuses;
	} catch (err) {
		console.error(err);
	}
	return null;
};

////////////////
exports.getTenantsTotals = async function(dbHelper) {
	try {
		let tenants_total = await dbHelper.query(`SELECT COUNT(*) AS total, tenant_name FROM galaxy_monitoring.monitoring WHERE created_at >= NOW() - INTERVAL 1 MONTH GROUP BY tenant_name ORDER BY tenant_name`);
		return tenants_total;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getTypesTotal = async function(dbHelper, tenant_id) {
	try {
		let types_total = await dbHelper.query(`SELECT COUNT(*) AS total, event_type FROM galaxy_monitoring.monitoring WHERE tenant_name = '${tenant_id}' AND created_at >= NOW() - INTERVAL 1 MONTH GROUP BY event_type ORDER BY event_type`);
		return types_total;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getStatusTotal = async function(dbHelper, type) {
	try {
		let types_total = await dbHelper.query(`SELECT COUNT(*) AS total, status FROM galaxy_monitoring.monitoring WHERE event_type = '${type}' AND created_at >= NOW() - INTERVAL 1 MONTH GROUP BY status ORDER BY status`);
		return types_total;
	} catch (err) {
		console.error(err);
	}
	return null;
};

////////////////
exports.updateMonitoringEvent = async function(dbHelper, obj, key) {
	try {
		const results = await dbHelper.update(`galaxy_monitoring.monitoring`, obj, key);
		return results;
	} catch (err) {
		console.error(err);
		throw err;
	}
	// return null;
};
exports.assignMonitoringEvent = async function(dbHelper, user_id, event_id) {
	try {
		let event = await dbHelper.update(`galaxy_monitoring.monitoring`, {user_id}, {event_id});
		return event;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.saveMonitoringUser = async function(dbHelper, obj) {
	try {
		//const id = utils.generateRandomID(2, 6);
		const id = exports.generateRandomID(2, 6);
		const user = {
			...obj,
			id
		};
		const results = await dbHelper.insertWithSet(`galaxy_monitoring.users`, user);
		// return results;
		return user;
	} catch (err) {
		console.error(err);
		throw err;
	}
	// return null;
};
exports.updateMonitoringUser = async function(dbHelper, obj, key) {
	try {
		let user = await dbHelper.update(`galaxy_monitoring.users`, obj, key);
		return user;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.removeMonitoringUserByEmail = async function(dbHelper, email) {
	try {
		let user = await dbHelper.delete(`galaxy_monitoring.users`, {email});
		return user;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getMonitoringUserByEmail = async function(dbHelper, email) {
	try {
		let user = await dbHelper.selectWithConditions(`galaxy_monitoring.users`, '*', {email});
		return user[0];
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getMonitoringUserByID = async function(dbHelper, id) {
	try {
		let user = await dbHelper.selectWithConditions(`galaxy_monitoring.users`, '*', {id});
		return user[0];
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.updateUserSocketConnection = async function(dbHelper, obj, key) {
	try {
		let user = await dbHelper.update(`galaxy_monitoring.users`, obj, key);
		return user;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getOnlineUsers = async function(dbHelper) {
	try {
		let users = await dbHelper.selectWithPreQuery(`galaxy_monitoring.users`, '*', 'online = TRUE AND conn_id IS NOT NULL');
		return users;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.insertSubscriptionEvent = async function(dbHelper, obj) {
	try {
		//const subscription_id = utils.generateRandomID(2, 6);
		const subscription_id = exports.generateRandomID(2, 6);
		const subscription = {
			...obj,
			subscription_id
		};
		const results = await dbHelper.insertWithSet(`galaxy_monitoring.subscribed_events`, subscription);
		return results;
	} catch (err) {
		console.error(err);
		throw err;
	}
	// return null;
};
exports.updateSubscriptionEvent = async function(dbHelper, obj, subscription_id) {
	try {
		let subscription = await dbHelper.update(`galaxy_monitoring.subscribed_events`, obj, {subscription_id});
		return subscription;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getSubscribedEvents = async function(dbHelper, user_id) {
	try {
		let subscriptions = await dbHelper.selectWithConditions(`galaxy_monitoring.subscribed_events`, '*', {user_id});
		return subscriptions;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.unsubscribeEvent = async function(dbHelper, subscription_id) {
	try {
		let subscription = await dbHelper.delete(`galaxy_monitoring.subscribed_events`, {subscription_id});
		return subscription;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getSubscribedEventsByType = async function(dbHelper, event_type) {
	try {
		let subscriptions = await dbHelper.selectWithConditions(`galaxy_monitoring.subscribed_events`, '*', {event_type});
		return subscriptions;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getSubscribedEventsByTypeTenant = async function(dbHelper, event_type, tenant_name) {
	try {
		let subscriptions = await dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, '*', `event_type = '${event_type}' AND (tenant_name = '${tenant_name}' OR tenant_name = '' OR tenant_name IS NULL)`);
		return subscriptions;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.insertFlaggedEvent = async function(dbHelper, obj) {
	try {
		//const flagged_id = utils.generateRandomID(2, 6);
		const flagged_id = exports.generateRandomID(2, 6);
		const flagged = {
			...obj,
			flagged_id
		};
		const results = await dbHelper.insertWithSet(`galaxy_monitoring.flagged_events`, flagged);
		return results;
	} catch (err) {
		console.error(err);
		throw err;
	}
	// return null;
};
exports.updateFlaggedEvent = async function(dbHelper, obj, flagged_id) {
	try {
		let flagged = await dbHelper.update(`galaxy_monitoring.flagged_events`, obj, {flagged_id});
		return flagged;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.updateFlaggedEventWithQuery = async function(dbHelper, obj, conditionStr) {
	try {
		let flagged = await dbHelper.updateWithPreQuery(`galaxy_monitoring.flagged_events`, obj, conditionStr);
		return flagged;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getFlaggedEvents = async function(dbHelper) {
	try {
		let flags = await dbHelper.select(`galaxy_monitoring.flagged_events`, '*');
		return flags;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getFlaggedEventByDescSubstr = async function(dbHelper, description) {
	try {
		let flags = await dbHelper.selectWithPreQuery(`galaxy_monitoring.flagged_events`, '*', `'${description}' LIKE CONCAT('%',description_substring,'%')`);
		return flags[0];
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getFlaggedEventByDescSubstrAndTenant = async function(dbHelper, description, tenant_id) {
	try {
		let flags = await dbHelper.selectWithPreQuery(`galaxy_monitoring.flagged_events`, '*', `tenant_id = '${tenant_id}' AND '${description}' LIKE CONCAT('%',description_substring,'%')`);
		return flags[0];
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.unflagEvent = async function(dbHelper, flagged_id) {
	try {
		let flagged = await dbHelper.delete(`galaxy_monitoring.flagged_events`, {flagged_id});
		return flagged;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getMonitoringCommentsByEventId = async function(dbHelper, conditionStr) {
	try {
		let events = await dbHelper.selectWithPreQuery(`galaxy_monitoring.event_comments`, '*', conditionStr);
		return events;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.saveMonitoringComment = async function(dbHelper, comment) {
	try {
		let results = await dbHelper.insertWithSet(`galaxy_monitoring.event_comments`, comment);
		return results;
	} catch (err) {
		console.error(err);
		// throw err;
	}
	return null;
};
exports.insertAgentQuery = async function(dbHelper, agent_query) {
	try {
		const results = await dbHelper.insertWithSet(`galaxy_monitoring.monitoring_agent_queries`, agent_query);
		return results;
	} catch (err) {
		console.error(err);
		throw err;
	}
	// return null;
};
exports.updateAgentQuery = async function(dbHelper, obj, key) {
	try {
		let agentQuery = await dbHelper.update(`galaxy_monitoring.monitoring_agent_queries`, obj, key);
		return agentQuery;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getAgentQueries = async function(dbHelper, lambda_name) {
	try {
		// let queries = await dbHelper.selectWithConditions(`galaxy_monitoring.monitoring_agent_queries`, '*', {lambda_name});
		let queries = await dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring_agent_queries`, '*', `lambda_name = '${lambda_name}' ORDER BY query_order ASC`);
		return queries;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.rmAgentQuery = async function(dbHelper, key) {
	try {
		let agentQuery = await dbHelper.delete(`galaxy_monitoring.monitoring_agent_queries`, key);
		return agentQuery;
	} catch (err) {
		console.error(err);
	}
	return null;
};

exports.saveDevOpsRequest = async function(dbHelper, obj) {
	try {
		//const id = utils.generateRandomID(2, 6);
		const id = exports.generateRandomID(2, 6);
		const devops_request = {
			...obj,
			id
		};
		const results = await dbHelper.insertWithSet(`galaxy_monitoring.request_manager`, devops_request);
		return results;
	} catch (err) {
		console.error(err);
		throw err;
	}
	// return null;
};
exports.updateDevOpsRequest = async function(dbHelper, obj, key) {
	try {
		let devops_request = await dbHelper.update(`galaxy_monitoring.request_manager`, obj, key);
		return devops_request;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.approveDevOpsRequest = async function(dbHelper, key) {
	try {
		let devops_request = await dbHelper.update(`galaxy_monitoring.request_manager`, {status: 'Approved'}, key);
		return devops_request;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.rejectDevOpsRequest = async function(dbHelper, key) {
	try {
		let devops_request = await dbHelper.update(`galaxy_monitoring.request_manager`, {status: 'Rejected'}, key);
		return devops_request;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.completeDevOpsRequest = async function(dbHelper, key) {
	try {
		let devops_request = await dbHelper.update(`galaxy_monitoring.request_manager`, {status: 'Processed'}, key);
		return devops_request;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getDevOpsRequests = async function(dbHelper) {
	try {
		let devops_requests = await dbHelper.select(`galaxy_monitoring.request_manager`, '*');
		return devops_requests;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.rmDevOpsRequest = async function(dbHelper, key) {
	try {
		let devops_request = await dbHelper.delete(`galaxy_monitoring.request_manager`, key);
		return devops_request;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.generateRandomID = (min, max) => {
	return (Math.random().toString(36).substring(min+1, max) + Math.random().toString(36).substring(min, max-1)).toUpperCase();
}

exports.getEvents = async function(dbHelper, conditionStr) {
	try {
		let events = await dbHelper.select(`galaxy_monitoring.events`, '*', conditionStr);
		return events;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getEventsTotal = async (dbHelper, conditionStr) => {
	try {
		let events = await dbHelper.selectWithPreQuery(`galaxy_monitoring.events`, 'COUNT(*) AS total', conditionStr);
		return events[0].total;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.removeEventByID = async function(dbHelper, id) {
	try {
		let event = await dbHelper.delete(`galaxy_monitoring.events`, {id});
		return event;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.saveEvent = async function(dbHelper, obj) {
	try {
		const id = exports.generateRandomID(2, 6);
		const event = {
			...obj,
			id
		};
		const results = await dbHelper.insertWithSet(`galaxy_monitoring.events`, event);
		return event;
	} catch (err) {
		console.error(err);
		throw err;
	}
};
exports.updateEvent = async function(dbHelper, obj, key) {
	try {
		let event = await dbHelper.update(`galaxy_monitoring.events`, obj, key);
		return event;
	} catch (err) {
		console.error(err);
	}
	return null;
};

exports.getUptimeApps = async function(dbHelper) {
	try {
		const sql = "SELECT DISTINCT grp FROM galaxy_monitoring.heartbeat;";
		let uptime_apps = await dbHelper.query(sql);
		return uptime_apps;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getUptimePlatform = async function(dbHelper, platform_id) {
	try {
		var group_sql = `
			SELECT 
				h1.grp,
				h2.resource,
				h3.*
			FROM 
				(SELECT DISTINCT grp FROM galaxy_monitoring.consolidated_heartbeat WHERE platform = '${platform_id}') h1
			JOIN
				(SELECT DISTINCT grp, resource FROM galaxy_monitoring.consolidated_heartbeat WHERE platform = '${platform_id}') h2 ON h1.grp = h2.grp
			LEFT JOIN 
				galaxy_monitoring.consolidated_heartbeat h3 ON h2.grp = h3.grp AND h2.resource = h3.resource
			WHERE 
				h3.platform = '${platform_id}'
			AND 
				h3.heartbeat < CURDATE()
			ORDER BY 
				h1.grp ASC, h2.resource`;

		let result = await dbHelper.query(group_sql);
		// console.log('--SQL result--', result);
		return result;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getUptimePlatformToday = async function(dbHelper, platform_id) {
	try {
		var group_sql = `
				SELECT *
				FROM galaxy_monitoring.heartbeat
				WHERE platform = '${platform_id}'
				AND DATE(heartbeat) = CURDATE()
				AND heartbeat = (
					SELECT MAX(heartbeat)
					FROM galaxy_monitoring.heartbeat
					WHERE platform = '${platform_id}'
					AND DATE(heartbeat) = CURDATE()
				);`;

		let result = await dbHelper.query(group_sql);
		return result;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getUptimePlatformSpecific = async function(dbHelper, platform_id, grp, resource, specific_date, description) {
	try {
		const specific_datetime = decodeURIComponent(specific_date);
		const specific_day = specific_datetime.split(' ')[0]; // 'YYYY-MM-DD'
	    const specific_time = specific_datetime.split(' ')[1]; // 'HH:MM:SS'
		const new_description = decodeURIComponent(description);

		var is_exist_consolidated_table = `
				SELECT *
				FROM galaxy_monitoring.consolidated_heartbeat
				WHERE platform = '${platform_id}'
				AND grp = '${grp}'
				AND resource = '${resource}'
				AND DATE(heartbeat) = '${specific_day}'`;

		let is_exist_consolidated_result = await dbHelper.query(is_exist_consolidated_table);
		let result;
		
		if (is_exist_consolidated_result.length > 0) {
			// update the hearbeat table's description field
			var update_heartbeat_sql = `
				UPDATE galaxy_monitoring.heartbeat
				SET description = '${new_description}',
					heartbeat = '${specific_datetime}'
				WHERE platform = '${platform_id}'
				AND grp = '${grp}'
				AND resource = '${resource}'
				AND DATE(heartbeat) = '${specific_day}'
				AND DATE_FORMAT(heartbeat, '%H:%i') <= '${specific_time}'`;

			await dbHelper.query(update_heartbeat_sql);

			// get heartbeat table's result 
			var group_sql = `
					SELECT *
					FROM galaxy_monitoring.heartbeat
					WHERE platform = '${platform_id}'
					AND grp = '${grp}'
					AND resource = '${resource}'
					AND DATE(heartbeat) = '${specific_day}'
					AND DATE_FORMAT(heartbeat, '%H:%i') <= '${specific_time}'
					AND heartbeat = (
						SELECT MAX(heartbeat)
						FROM galaxy_monitoring.heartbeat
						WHERE platform = '${platform_id}'
						AND grp = '${grp}'
						AND resource = '${resource}'
						AND DATE(heartbeat) = '${specific_day}'
						AND DATE_FORMAT(heartbeat, '%H:%i') <= '${specific_time}'
					);`;

			result = await dbHelper.query(group_sql);

			// Assuming the result contains the status and description to update
			if (result && result.length > 0) {
				const { status } = result[0]; // Getting status from result
				
				var update_sql = `
					UPDATE galaxy_monitoring.consolidated_heartbeat
					SET status = '${status}',
						description = '${new_description}',
						heartbeat = '${specific_datetime}'
					WHERE platform = '${platform_id}'
					AND grp = '${grp}'
					AND resource = '${resource}'
					AND DATE(heartbeat) = '${specific_day}'`;

				await dbHelper.query(update_sql);
			}
		}else {
			var insert_consolidated_table_sql = `
				INSERT INTO galaxy_monitoring.consolidated_heartbeat (
					platform,
					grp,
					resource,
					status,
					description,
					heartbeat
				) VALUES (
					'${platform_id}',
					'${grp}',
					'${resource}',
					'',
					'${new_description}',
					'${specific_datetime}'
				);`;

			await dbHelper.query(insert_consolidated_table_sql);

			// get consolidated_heartbeat table's result 
			var group_sql = `
					SELECT *
					FROM galaxy_monitoring.consolidated_heartbeat
					WHERE platform = '${platform_id}'
					AND grp = '${grp}'
					AND resource = '${resource}'
					AND DATE(heartbeat) = '${specific_day}'
					AND heartbeat = (
						SELECT MAX(heartbeat)
						FROM galaxy_monitoring.consolidated_heartbeat
						WHERE platform = '${platform_id}'
						AND grp = '${grp}'
						AND resource = '${resource}'
						AND DATE(heartbeat) = '${specific_day}'
					);`;

			result = await dbHelper.query(group_sql);
		}

		return result;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getStatusByDate = async function(dbHelper, platform_id, grp, resource, specific_date) {
	try {
		const specific_datetime = decodeURIComponent(specific_date);
		const specific_day = specific_datetime.split(' ')[0]; // 'YYYY-MM-DD'
	    const specific_time = specific_datetime.split(' ')[1]; // 'HH:MM:SS'
		
		// get heartbeat table's result 
		var group_sql = `
				SELECT *
				FROM galaxy_monitoring.heartbeat
				WHERE platform = '${platform_id}'
				AND grp = '${grp}'
				AND resource = '${resource}'
				AND heartbeat = (
					SELECT MAX(heartbeat)
					FROM galaxy_monitoring.heartbeat
					WHERE platform = '${platform_id}'
					AND grp = '${grp}'
					AND resource = '${resource}'
					AND heartbeat <= DATE_SUB('${specific_datetime}', INTERVAL 4 HOUR)
				)`;

		let result = await dbHelper.query(group_sql);

		return result;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getUptimeAllApps = async function(dbHelper) {
	try {
		const sql = "SELECT DISTINCT resource FROM galaxy_monitoring.consolidated_heartbeat;";
		let uptime_apps = await dbHelper.query(sql);
		return uptime_apps;
	} catch (err) {
		console.error(err);
	}
	return null;
};
exports.getUptimeTotal = async function(dbHelper, app_name, starting_date, last_date) {
	try {
		var sql = `SELECT * FROM galaxy_monitoring.consolidated_heartbeat WHERE resource = '${app_name}' AND DATE(heartbeat) BETWEEN '${starting_date}' AND '${last_date}' ORDER BY heartbeat ASC`;
		let uptime_total = await dbHelper.query(sql);
		return uptime_total;
	} catch (err) {
		console.error(err);
	}
	return null;
};

exports.getActiveTenants = async (dbHelper, STAGE) => {
    var all_tenants = [];
    try{
        var stage_1 = STAGE.toLowerCase();
        var stage_2 = "";
        if('prod' == stage_1){
            stage_2 = "prod2"
        }else if('dr' == stage_1){
            stage_2 = "dr2"
        }
		var stage1_tenants = await this.getActiveTenantsByStage(dbHelper, stage_1);
		if(stage1_tenants && stage1_tenants.length > 0) {
			console.log(`Stage_1 Tenants:${stage1_tenants}`);
			all_tenants.push({"stage":stage_1,tenants:stage1_tenants});
		}
        
        var stage2_tenants = await this.getActiveTenantsByStage(dbHelper, stage_2);
		if(stage2_tenants && stage2_tenants.length > 0) {
			console.log(`Stage_2 Tenants:${stage2_tenants}`);
        	all_tenants.push({"stage":stage_2,tenants:stage2_tenants});
		}
    }catch (e) {
        console.log(e);
		return ;
    }
    return all_tenants;
};

exports.getActiveTenantsByStage = async (dbHelper, STAGE) => {
    var tenants = null;
    try{
        const TENANTS_KEY = 'bankos.tenants';
        const qry = `SELECT value from finzly_configserver_${STAGE}.properties where prop_key = '${TENANTS_KEY}' and profile='${STAGE.toUpperCase()}'`;
        const results = await dbHelper.query(qry);
        tenants = results[0].value.split(',');
        console.log(`tenants:${tenants}`);
    }catch (e) {
        console.log(e);
		return ;
    }
    return tenants;
};

exports.getConfigParameterWithTenant = async function(dbHelper, tenant_name, STAGE) {
	var result = {};

	try {
		const TENANTS_KEY1 = `bankos.scheduler.tenant.${tenant_name}.url`;
		const TENANTS_KEY2 = `bankos.scheduler.tenant.${tenant_name}.username`;

		const query1 = `SELECT value FROM finzly_configserver_${STAGE}.properties WHERE prop_key='${TENANTS_KEY1}' and profile='${STAGE.toUpperCase()}'`;
		const result1 = await dbHelper.query(query1);
		if(!result1) {
			return;
		}
		console.log('------', result1)
		const url = result1[0].value;

		const query2 = `SELECT value FROM finzly_configserver_${STAGE}.properties WHERE prop_key='${TENANTS_KEY2}' and profile='${STAGE.toUpperCase()}'`;
		const result2 = await dbHelper.query(query2);
		if(!result2) {
			return;
		}
		console.log(result2);
		const username = result2[0].value;

		result = {
			url: url,
			username: username
		};

		return result;
	}
	catch (e) {
		console.log(e)
		return;
	}
}