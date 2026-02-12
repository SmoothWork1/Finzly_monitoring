module.exports = async function (awsmanager) {
    awsmanager.prototype.insertMonitoringEvent = async function(/* obj */event) {
		try {
			// const event_id = this.utils.generateRandomID(2, 6);
            // const event = {
			// 	...obj,
			// 	event_id
            // };
			const results = await this.dbHelper.insertWithSet(`galaxy_monitoring.monitoring`, event);
			return results;
		} catch (err) {
			this.log.error(err);
			throw err;
		}
		// return null;
	};
    awsmanager.prototype.notificationViewedByUser = async function(user_id, event_id) {
		try {
			const results = await this.dbHelper.insertWithSet(`galaxy_monitoring.user_notifications`, {user_id, event_id});
			return results;
		} catch (err) {
			this.log.error(err);
			throw err;
		}
		// return null;
	};
	awsmanager.prototype.getViewedNotifications = async function(user_id) {
        try {
			let notifications = await this.dbHelper.selectWithConditions(`galaxy_monitoring.user_notifications`, '*', {user_id});
            return notifications;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getHeartbeats = async function() {
        try {
			let beats = await this.dbHelper.select(`galaxy_monitoring.heartbeats`, '*');
            return beats;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getHeartbeatByKey = async function(event_id, source_system) {
        try {
			let beats = await this.dbHelper.selectWithConditions(`galaxy_monitoring.heartbeats`, '*', {event_id, source_system});
            return beats[0];
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.insertHeartbeat = async function(/* obj */event) {
		try {
			const results = await this.dbHelper.insertWithSet(`galaxy_monitoring.heartbeats`, event);
			return results;
		} catch (err) {
			this.log.error(err);
			throw err;
		}
		// return null;
	};
	awsmanager.prototype.updateHeartbeat = async function(obj, key) {
		try {
			const results = await this.dbHelper.update(`galaxy_monitoring.heartbeats`, obj, key);
			return results;
		} catch (err) {
			this.log.error(err);
			throw err;
		}
		// return null;
	};
	awsmanager.prototype.getMonitoringEvents = async function(conditionStr) {
        try {
			// let event = await this.dbHelper.selectWithConditions(`galaxy_monitoring.monitoring`, '*', {event_type, tenant_name});
			// this.log.info("QUERY: ", `SELECT * FROM galaxy_monitoring.monitoring WHERE ${conditionStr}`);
			let events = await this.dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, '*', conditionStr);
            return events;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getMonitoringEventCount = async function(conditionStr) {
		try {
			let event = await this.dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, 'COUNT(*) AS total', conditionStr);
            return event[0].total;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getScheduledEventCountByType = async function() {
        try {
			let event = await this.dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, 'COUNT(*) AS count, event_type', `status = 'Active' AND event_type = 'SCHEDULED_MAINTENANCE' GROUP BY event_type`);
            return event;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getTodayEventCountByType = async function() {
        try {
			const CDT = new Date();
			CDT.setHours(CDT.getHours()-5);
			let day = CDT.getDate();
			day = day < 10 ? '0'+day : day;
			let month = CDT.getMonth()+1;
			month = month < 10 ? '0'+month : month;
			const CDTstr = `${CDT.getFullYear()}-${month}-${day}`;
			let event = await this.dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, 'COUNT(*) AS count, event_type', `DATE(created_at) = '${CDTstr}' AND status = 'Active' AND event_type != 'SCHEDULED_MAINTENANCE' GROUP BY event_type`);
            return event;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getEventCountByType = async function() {
        try {
			let event = await this.dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, 'COUNT(*) AS count, event_type', `status = 'Active' AND event_type != 'SCHEDULED_MAINTENANCE' GROUP BY event_type`);
            return event;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getTodayEventCountByGivenTypes = async function(condQuery) {
        try {
			const CDT = new Date();
			CDT.setHours(CDT.getHours()-5);
			let day = CDT.getDate();
			day = day < 10 ? '0'+day : day;
			let month = CDT.getMonth()+1;
			month = month < 10 ? '0'+month : month;
			const CDTstr = `${CDT.getFullYear()}-${month}-${day}`;
			let event = await this.dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, 'COUNT(*) AS count, event_type', `DATE(created_at) = '${CDTstr}' AND status = 'Active' AND (${condQuery}) GROUP BY event_type`);
            return event;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getTodayEventsByGivenTypes = async function(condQuery) {
        try {
			const CDT = new Date();
			CDT.setHours(CDT.getHours()-5);
			let day = CDT.getDate();
			day = day < 10 ? '0'+day : day;
			let month = CDT.getMonth()+1;
			month = month < 10 ? '0'+month : month;
			const CDTstr = `${CDT.getFullYear()}-${month}-${day}`;
			let event = await this.dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, '*', `DATE(created_at) = '${CDTstr}' AND status = 'Active' AND (${condQuery}) ORDER BY created_at DESC`);
            return event;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getActiveEventsByGivenTypes = async function(condQuery) {
        try {
			let event = await this.dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, '*', `status = 'Active' AND (${condQuery}) ORDER BY created_at DESC`);
            return event;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getMonitoringUsers = async function() {
        try {
			let users = await this.dbHelper.select(`galaxy_monitoring.users`, '*');
            return users;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getRecentEvents = async function(tenant_name, status) {
        try {
			let event = await this.dbHelper.conditionalSelectWithOrder(`galaxy_monitoring.monitoring`, '*', {status, tenant_name}, 'created_at DESC', '10');
            return event;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getActiveEvents = async function(tenant_name, status) {
        try {
			let event = await this.dbHelper.selectWithConditions(`galaxy_monitoring.monitoring`, '*', {status, tenant_name});
            return event;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getDashboardTotals = async function(tenant_name) {
        try {
			let statuses = await this.dbHelper.query(`SELECT COUNT(*) AS total, status FROM galaxy_monitoring.monitoring WHERE tenant_name = '${tenant_name}' GROUP BY status`);
            return statuses;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.updateMonitoringEvent = async function(obj, key) {
		try {
			const results = await this.dbHelper.update(`galaxy_monitoring.monitoring`, obj, key);
			return results;
		} catch (err) {
			this.log.error(err);
			throw err;
		}
		// return null;
	};
	awsmanager.prototype.assignMonitoringEvent = async function(user_id, event_id) {
        try {
			let event = await this.dbHelper.update(`galaxy_monitoring.monitoring`, {user_id}, {event_id});
            return event;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
    awsmanager.prototype.saveMonitoringUser = async function(obj) {
		try {
			const id = this.utils.generateRandomID(2, 6);
            const user = {
				...obj,
				id
            };
			const results = await this.dbHelper.insertWithSet(`galaxy_monitoring.users`, user);
			// return results;
			return user;
		} catch (err) {
			this.log.error(err);
			throw err;
		}
		// return null;
	};
	awsmanager.prototype.getMonitoringUserByEmail = async function(email) {
        try {
			let user = await this.dbHelper.selectWithConditions(`galaxy_monitoring.users`, '*', {email});
            return user[0];
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getMonitoringUserByID = async function(id) {
        try {
			let user = await this.dbHelper.selectWithConditions(`galaxy_monitoring.users`, '*', {id});
            return user[0];
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.updateUserSocketConnection = async function(obj, key) {
        try {
			let user = await this.dbHelper.update(`galaxy_monitoring.users`, obj, key);
            return user;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getOnlineUsers = async function() {
        try {
			let users = await this.dbHelper.selectWithPreQuery(`galaxy_monitoring.users`, '*', 'online = TRUE AND conn_id IS NOT NULL');
            return users;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.insertSubscriptionEvent = async function(obj) {
		try {
			const subscription_id = this.utils.generateRandomID(2, 6);
            const subscription = {
				...obj,
				subscription_id
            };
			const results = await this.dbHelper.insertWithSet(`galaxy_monitoring.subscribed_events`, subscription);
			return results;
		} catch (err) {
			this.log.error(err);
			throw err;
		}
		// return null;
	};
	awsmanager.prototype.updateSubscriptionEvent = async function(obj, subscription_id) {
        try {
			let subscription = await this.dbHelper.update(`galaxy_monitoring.subscribed_events`, obj, {subscription_id});
            return subscription;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getSubscribedEvents = async function(user_id) {
        try {
			let subscriptions = await this.dbHelper.selectWithConditions(`galaxy_monitoring.subscribed_events`, '*', {user_id});
            return subscriptions;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.unsubscribeEvent = async function(subscription_id) {
        try {
			let subscription = await this.dbHelper.delete(`galaxy_monitoring.subscribed_events`, {subscription_id});
            return subscription;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getSubscribedEventsByType = async function(event_type) {
        try {
			let subscriptions = await this.dbHelper.selectWithConditions(`galaxy_monitoring.subscribed_events`, '*', {event_type});
            return subscriptions;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getSubscribedEventsByTypeTenant = async function(event_type, tenant_name) {
        try {
			let subscriptions = await this.dbHelper.selectWithPreQuery(`galaxy_monitoring.monitoring`, '*', `event_type = '${event_type}' AND (tenant_name = '${tenant_name}' OR tenant_name = '' OR tenant_name IS NULL)`);
            return subscriptions;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.insertFlaggedEvent = async function(obj) {
		try {
			const flagged_id = this.utils.generateRandomID(2, 6);
            const flagged = {
				...obj,
				flagged_id
            };
			const results = await this.dbHelper.insertWithSet(`galaxy_monitoring.flagged_events`, flagged);
			return results;
		} catch (err) {
			this.log.error(err);
			throw err;
		}
		// return null;
	};
	awsmanager.prototype.updateFlaggedEvent = async function(obj, flagged_id) {
        try {
			let flagged = await this.dbHelper.update(`galaxy_monitoring.flagged_events`, obj, {flagged_id});
            return flagged;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getFlaggedEvents = async function() {
        try {
			let flags = await this.dbHelper.select(`galaxy_monitoring.flagged_events`, '*');
            return flags;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getFlaggedEventByDescSubstr = async function(description) {
        try {
			let flags = await this.dbHelper.selectWithPreQuery(`galaxy_monitoring.flagged_events`, '*', `'${description}' LIKE CONCAT('%',description_substring,'%')`);
            return flags[0];
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.unflagEvent = async function(flagged_id) {
        try {
			let flagged = await this.dbHelper.delete(`galaxy_monitoring.flagged_events`, {flagged_id});
            return flagged;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.getMonitoringCommentsByEventId = async function(conditionStr) {
        try {
			let events = await this.dbHelper.selectWithPreQuery(`galaxy_monitoring.event_comments`, '*', conditionStr);
            return events;
        } catch (err) {
            this.log.error(err);
        }
        return null;
	};
	awsmanager.prototype.saveMonitoringComment = async function(comment) {
        try {
			let results = await this.dbHelper.insertWithSet(`galaxy_monitoring.event_comments`, comment);
            return results;
        } catch (err) {
            this.log.error(err);
			// throw err;
        }
        return null;
	};
}