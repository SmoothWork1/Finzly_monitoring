import http from './amplifyApi';

// session
// export const loginReq = (data) => {
// 	return http.post('admin-login', ``, data); // { username, password }
// };
export const registerReq = (data) => {
	return http.post('admin-onboarding', ``, data); // { first_name, last_name, email, password, address, type, contact_number }
};
// export const verifyReq = (data) => {
// 	return http.put('verify-admin', ``, data); // { username, confirmation_code }
// };
export const profileReq = () => {
	return http.get('profile', ``);
}; // { id, first_name, last_name, email, address, type, contact_number }

// monitoring events
export const getMonitoringEventsReq = (type, page, filter, params) => {
	return http.get('get-monitoring-events', `/${type}/${page}/${filter}`, params);
};
export const getMonitoringEventReq = (event_id) => {
	return http.get('get-monitoring-event', `/${event_id}`);
};
export const getEventTypeCountReq = () => {
	return http.get('recent-event-type-count', ``);
};
export const updMonitoringEventReq = (data) => {
	return http.put('update-monitoring-event', ``, data); // { event_id, status, comment }
};
export const addEventCommentReq = (data) => {
	return http.post('add-event-comment', ``, data); // { event_id, comment }
};
export const assignEventReq = (data) => {
	return http.put('assign-monitoring-event', ``, data); // { event_id, user_id }
};

// notifications
export const getNotificationsReq = () => {
	return http.get('get-notifications', ``);
};
export const clearNotificationsReq = () => {
	return http.put('clear-notifications', ``);
};
export const notificationViewedReq = (data) => {
	return http.post('notification-viewed', ``, data); // { event_id, user_id }
};

// dashboard
export const getDashboardReq = () => {
	return http.get('dashboard', ``);
};
export const getPieChartDataReq = (tenant, type) => {
	return http.get('dashboard_chart', `/${tenant || `0`}/${type || `0`}`);
};
export const getBlocksReq = () => {
	return http.get('blocks', ``);
};

// users
export const addUserReq = (data) => {
	return http.post('users', ``, data); // { first_name, last_name, email, password, contact_number, address, type, devops_type, tenant_id }
};
export const updUserReq = (data) => {
	return http.put('users', ``, data); // { id, first_name, last_name, email, contact_number, address, type, devops_type, tenant_id }
};
export const getUsersReq = () => {
	return http.get('users', ``);
};
export const getManagableUsersReq = () => {
	return http.get('managable-users', ``);
};
export const rmUserReq = (data) => {
	return http.del('users', ``, data); // { email }
};

// events
export const getEventsReq = (page, params) => {
	return http.get('events', `/pages/${page || `0`}`, params);
};
export const rmEventReq = (data) => {
	return http.del('events', ``, data); // { id }
};
export const addEventReq = (data) => {
	return http.post('events', ``, data); // { name, configuration, application, platform, event_type }
};
export const updEventReq = (data) => {
	return http.put('events', ``, data); // { id, name, configuration, application, platform, event_type }
};

// subscriptions
export const subscribeEventReq = (data) => {
	return http.post('event-subscription', ``, data); // {.user_id, event_type, delivery_method, deliver_to }
};
export const getEventSubscriptionsReq = () => {
	return http.get('event-subscriptions', ``);
};
export const updEventSubscriptionReq = (data) => {
	return http.put('event-subscription', ``, data); // { subscription_id, user_id, event_type, delivery_method, deliver_to }
};
export const unsubscribeEventReq = (subscriptionid) => {
	return http.del('event-subscription', `/${subscriptionid}`);
};

// subscriptions
export const flagEventReq = (data) => {
	return http.post('flag-event', ``, data); // {.user_id, description_substring }
};
export const getFlaggedEventsReq = () => {
	return http.get('get-flagged-events', ``);
};
export const updEventFlagReq = (data) => {
	return http.put('update-event-flag', ``, data); // { flagged_id, user_id, description_substring }	
};
export const unflagEventReq = (flaggedid) => {
	return http.del('unflag-event', `/${flaggedid}`);
};

// heartbeats
export const getHeartbeatsReq = () => {
	return http.get('heartbeats', ``);
};

// Function Schedules
export const getFunctionsByFilterReq = () => {
	return http.get('function-by-filter', ``);
};
export const getEventFunctionNamesReq = (event_type) => {
	return http.get('get-event-function-names', `/${event_type}`);
};
export const getFunctionSchedulesReq = (fn_arn) => {
	return http.get('function-schedules', `/${fn_arn}`);
};
export const updFunctionScheduleReq = (data) => {
	return http.put('update-function-schedules', ``, data); // { schedulerName, expression }
};


// Agent Queries
export const addAgentQueryReq = (data) => {
	return http.post('agent-queries', ``, data); // {.lambda_name, query_name, query, query_result, query_order }
};
export const updAgentQueryReq = (data) => {
	return http.put('agent-queries', ``, data); // {.lambda_name, query_name, query, query_result, query_order }
};
export const getAgentQueriesReq = (lambda_name) => {
	return http.get('agent-queries', `/${lambda_name}`);
};
export const rmAgentQueryReq = (lambda_name, query_name) => {
	return http.del('agent-queries', `/${lambda_name}/${query_name}`);
};

// DevOps Requests
export const addDevOpsRequestReq = (data) => {
	return http.post('devops-requests', ``, data); // {.execution_date. command }
};
export const updDevOpsRequestReq = (data) => {
	return http.put('devops-requests', ``, data); // {.id, execution_date. command }
};
export const getDevOpsRequestsReq = () => {
	return http.get('devops-requests', ``);
};
export const rmDevOpsRequestReq = (request_id) => {
	return http.del('devops-requests', `/${request_id}`);
};
export const approveDevOpsRequestReq = (request_id) => {
	return http.put('devops-requests', `/approve/${request_id}`);
};
export const rejectDevOpsRequestReq = (request_id) => {
	return http.put('devops-requests', `/reject/${request_id}`);
};
export const completeDevOpsRequestReq = (request_id) => {
	return http.put('devops-requests', `/complete/${request_id}`);
};

// Uptime
export const getUptimeAppsReq = () => {
	return http.get('get-uptime-apps', ``);
}

export const getUptimePlatformReq = (platform_id) => {
	return http.get('get-uptime-platform', `/${platform_id}`);
}

export const getUptimePlatformTodayReq = (platform_id) => {
	return http.get('get-uptime-platform-today', `/${platform_id}`);
}

export const getUptimePlatformSpecificReq = (platform_id, grp, resource, specific_date, textareaContent) => {
	return http.get('get-uptime-platform-specific', `/${platform_id}/${grp}/${resource}/${specific_date}/${textareaContent}`);
}

export const getStatusByDate = (platform_id, grp, resource, specific_date) => {
	return http.get('get-status-by-date', `/${platform_id}/${grp}/${resource}/${specific_date}`);
}

export const getUptimeAllAppsReq = () => {
	return http.get('get-uptime-allapps', ``);
}

export const getUptimeTotalReq = (app_name, starting_date, last_date) => {
	return http.get('get-uptime-total', `/${app_name}/${starting_date}/${last_date}`);
}

export const getActiveTenantsReq = () => {
	return http.get('get-active-tenants', ``);
}

export const getJobConfigsReq = (stage, name) => {
	return http.get('get-job-configs', `/${stage}/${name}`);
}