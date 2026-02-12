//const url = `https://${process.env.REACT_APP_HOSTNAME}/${process.env.REACT_APP_STAGE}/`;
// const url = `https://${process.env.REACT_APP_HOSTNAME}/`;
// const ra_url = `https://${process.env.REACT_APP_RA_HOSTNAME}/`;

const url = `${process.env.REACT_APP_HOSTNAME}/`;
const ra_url = `${process.env.REACT_APP_RA_HOSTNAME}/`;
// const ra_external_url = `https://${process.env.REACT_APP_RA_EXTERNAL_HOSTNAME}/`;
const region = process.env.REACT_APP_REGION;
// const external_region = process.env.REACT_APP_RA_EXTERNAL_REGION;
const config = {
	user: {
		userPoolId: process.env.REACT_APP_USER_POOL_ID,
		userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
		userPoolRegion: process.env.REACT_APP_USER_POOL_REGION,
		identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
	},
	apiGateway: {
		URLs: [
			// Monitoring Service
			// { name: 'admin-login', service: "lambda", region: region, endpoint: `${url}login` },
			{ name: 'admin-onboarding', service: "lambda", region: region, endpoint: `${url}register` },
			// { name: 'verify-admin', service: "lambda", region: region, endpoint: `${url}verify_admin` },
			// { name: 'forgot-password', service: "lambda", region: region, endpoint: `${url}forgot` },
			// { name: 'confirm-forgot-password', service: "lambda", region: region, endpoint: `${url}confirm_forgot` },
			{ name: 'get-monitoring-events', service: "lambda", region: region, endpoint: `${url}get_monitoring_events` },
			{ name: 'get-monitoring-event', service: "lambda", region: region, endpoint: `${url}get_monitoring_event` },
			{ name: 'update-monitoring-event', service: "lambda", region: region, endpoint: `${url}update_monitoring_event` },
			{ name: 'add-event-comment', service: "lambda", region: region, endpoint: `${url}add_event_comment` },
			{ name: 'assign-monitoring-event', service: "lambda", region: region, endpoint: `${url}assign_monitoring_event` },

			{ name: 'dashboard', service: "lambda", region: region, endpoint: `${url}dashboard` },
			{ name: 'dashboard_chart', service: "lambda", region: region, endpoint: `${url}dashboard_chart` },
			{ name: 'blocks', service: "lambda", region: region, endpoint: `${url}blocks` },
			{ name: 'get-notifications', service: "lambda", region: region, endpoint: `${url}get_notifications` },
			{ name: 'clear-notifications', service: "lambda", region: region, endpoint: `${url}clear_notifications` },
			{ name: 'notification-viewed', service: "lambda", region: region, endpoint: `${url}notification_viewed` },

			// { name: 'get-users', service: "lambda", region: region, endpoint: `${url}users` },
			{ name: 'users', service: "lambda", region: region, endpoint: `${url}users` },
			{ name: 'events', service: "lambda", region: region, endpoint: `${url}events` },
			{ name: 'managable-users', service: "lambda", region: region, endpoint: `${url}managable_users` },

			{ name: 'event-subscription', service: "lambda", region: region, endpoint: `${url}event_subscription` },
			{ name: 'event-subscriptions', service: "lambda", region: region, endpoint: `${url}event_subscriptions` },

			{ name: 'flag-event', service: "lambda", region: region, endpoint: `${url}flag_event` },
			{ name: 'update-event-flag', service: "lambda", region: region, endpoint: `${url}update_event_flag` },
			{ name: 'get-flagged-events', service: "lambda", region: region, endpoint: `${url}get_flagged_events` },
			{ name: 'unflag-event', service: "lambda", region: region, endpoint: `${url}unflag_event` },
			{ name: 'recent-event-type-count', service: "lambda", region: region, endpoint: `${url}recent_event_type_count` },

			{ name: 'profile', service: "lambda", region: region, endpoint: `${url}profile` },

			{ name: 'heartbeats', service: "lambda", region: region, endpoint: `${url}heartbeats` },

			{ name: 'agent-queries', service: "lambda", region: region, endpoint: `${url}agent_queries` },
			{ name: 'devops-requests', service: "lambda", region: region, endpoint: `${url}requests` },

			// Release Automation
			{ name: 'tenants', service: "lambda", region: region, endpoint: `${ra_url}tenants` },
			{ name: 'releases', service: "lambda", region: region, endpoint: `${ra_url}releases` },
			{ name: 'environments', service: "lambda", region: region, endpoint: `${ra_url}environments` },
			{ name: 'tenants-environments', service: "lambda", region: region, endpoint: `${ra_url}tenants/environments` },
			{ name: 'releases-environments', service: "lambda", region: region, endpoint: `${ra_url}releases/environments` },
			{ name: 'execution-info', service: "lambda", region: region, endpoint: `${ra_url}execution_info` },
			{ name: 'executions', service: "lambda", region: region, endpoint: `${ra_url}executions` },
			// { name: 'stagings', service: "lambda", region: region, endpoint: `${ra_url}stagings` },
			{ name: 'exec-inputs', service: "lambda", region: region, endpoint: `${ra_url}exec_inputs` },
			{ name: 'configurations', service: "lambda", region: region, endpoint: `${ra_url}configurations` },
			{ name: 'applications', service: "lambda", region: region, endpoint: `${ra_url}applications` },
			{ name: 'devops-properties', service: "lambda", region: region, endpoint: `${ra_url}devops_properties` },
			{ name: 'onboarding-questions', service: "lambda", region: region, endpoint: `${ra_url}onboarding_questions` },
			{ name: 'db-schema-updates', service: "lambda", region: region, endpoint: `${ra_url}db_schema_updates` },

			// Function Schedule
			{ name: 'function-by-filter', service: "lambda", region: region, endpoint: `${url}get-function-by-filter` },
			{ name: 'function-schedules', service: "lambda", region: region, endpoint: `${url}get-function-schedules` },
			{ name: 'update-function-schedules', service: "lambda", region: region, endpoint: `${url}update-function-schedule` },
			{ name: 'get-event-function-names', service: "lambda", region: region, endpoint: `${url}get_event_function_names` },

			// Uptime
			{ name: 'get-uptime-apps', service: "lambda", region: region, endpoint: `${url}uptime/apps` },
			{ name: 'get-uptime-platform', service: "lambda", region: region, endpoint: `${url}uptime/platform` },
			{ name: 'get-uptime-platform-today', service: "lambda", region: region, endpoint: `${url}uptime/platformtoday` },
			{ name: 'get-uptime-platform-specific', service: "lambda", region: region, endpoint: `${url}uptime/platformspecific` },
			{ name: 'get-status-by-date', service: "lambda", region: region, endpoint: `${url}uptime/statusbydate` },
			{ name: 'get-uptime-allapps', service: "lambda", region: region, endpoint: `${url}uptime/allapps` },
			{ name: 'get-uptime-total', service: "lambda", region: region, endpoint: `${url}uptime/total` },

			{ name: 'get-active-tenants', service: "lambda", region: region, endpoint: `${url}get-active-tenants` },
			{ name: 'get-job-configs', service: "lambda", region: region, endpoint: `${url}get-job-configs` },
		]
	}
};

export default config;