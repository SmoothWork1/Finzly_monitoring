// import { createBrowserHistory } from 'history';

// export const history = createBrowserHistory(/* { basename: '/' } */);

// export const defImg = 'placeholder.png';

export const statuses = ["Active", "Ignored", "Resolved"];
export const sources = ["Lambda", "Online", "Offline"];

export const msPerDay = 86400000;
export const msPerHour = 3600000;
export const msPerMinute = 60000;

export const unpaginatedTableSize = 10000;
export const paginatedTableSize = 11;

export const pageTitles = {
	ssl: "SSL Expirations",
	rtExceptions: "Runtime Exceptions",
	prodIssues: "Production Issues",
	serverHealth: "Application Health",
	appProcessHealth: "Website Health",
	mqHealth: "MQ Health",
	achInbound: "ACH Inbound Files Process Issues",
	achOutbound: "ACH Outbound Files Process Issues",
	bulk: "Bulkfile Process Issues",
	paymentFailure: "Failed Payments",
	stuckPayments: "Stuck Payments",
	notification: "Notification Issues",
	job: "Job Execution Issues",

	passExp: "Password Expiration",
	upConns: "Upstream Connections",
	vpnStatus: "VPN Status",
	// schedMaint: "Scheduled Maintenance",
	rtMsg: "Real Time Message Issues",
}; // url to title

export const blockTitles = {
	'prod_issues': 'Production Issues',
	'server_health': 'Application Health',
	'ach_failure': 'Failed ACH Files',
	'payment_failure': 'Failed Payment',
	'stuck_payments': 'Stuck Payments',
	'ssl_expirations': 'SSL Expirations',
	'rt_exceptions': 'Runtime Exceptions',
	'app_process_health': 'Website Health',
	'bulkfile': 'Bulkfile Issues',
	'mq_health': 'MQ Health',
	'pass_exp': 'Password Expiration',
	'up_conns': 'Upstream Connections',
	'vpn_status': 'VPN Status',
	// 'sched_maint': 'Scheduled Maintenance',
	'rt_messaging': 'Real Time Message Issues',
	'notification': 'Notification Issues',
	'job': 'Job Execution Issues',
}; // response to title

export const eventTitles = {
	SSL_EXPIRATIONS: "SSL Expiration",
	RUNTIME_EXCEPTIONS: "Exception",
	PROD_ISSUES: "Production Issue",
	SERVER_HEALTH: "Infrastructure Issue",
	APP_PROCESS_HEALTH: "Web Issue",
	MQ_HEALTH: "MQ Issue",

	ACH_INBOUND_PROCESS_PENDING: "Process Pending - Inbound",
	ACH_INBOUND_PROCESS_FAILURE: "Process Failure - Inbound",
	ACH_INBOUND_UNKOWN_RTN: "Unkown Routing Number",
	ACH_OUTBOUND_PROCESS_PENDING: "Process Pending - Outbound",
	ACH_OUTBOUND_PROCESS_FAILURE: "Process Failure - Outbound",
	BULKFILE_PROCESS_PENDING: "Process Pending - Bulkfile",
	BULKFILE_PROCESS_FAILURE: "Process Failure - Bulkfile",
	PAYMENT_FAILURE: "Failed Payment",
	STUCK_PAYMENTS: "Stuck Payments",

	// NOTIFICATION_FAILURE: "Notification Failure",
	// NOTIFICATION_PENDING_DELIVERY: "Notification Pending Delivery",
	NOTIFICATIONS: "Notification Issues",
	JOB_EXECUTION_FAILURE: "Job Execution Failure",

	PASSWORD_EXPIRATION: "Password Expiration",
	UPSTREAM_CONNECTIONS: "Upstream Connections",
	VPN_STATUS: "VPN Status",
	// SCHEDULED_MAINTENANCE: "Scheduled Maintenance",
	MESSAGE_FAILURES: "Real Time Message Issues"
}; // database to table/list

export const eventTypeOptions = [
	{value: "SSL_EXPIRATIONS", name: "SSL Expiration"},
	{value: "RUNTIME_EXCEPTIONS", name: "Exception"},
	{value: "PROD_ISSUES", name: "Production Issue"},
	{value: "SERVER_HEALTH", name: "Infrastructure Issue"},
	{value: "APP_PROCESS_HEALTH", name: "Web Issue"},
	{value: "MQ_HEALTH", name: "MQ Issue"},
	{value: "ACH_INBOUND_PROCESS_PENDING", name: "ACH Inbound Files"},
	// {value: "ACH_INBOUND_PROCESS_PENDING", name: "Process Pending - Inbound"},
	// {value: "ACH_INBOUND_PROCESS_FAILURE", name: "Process Failure - Inbound"},
	// {value: "ACH_INBOUND_UNKOWN_RTN", name: "Unkown Routing Number"},
	{value: "ACH_OUTBOUND_PROCESS_PENDING", name: "ACH Outbound Files"},
	// {value: "ACH_OUTBOUND_PROCESS_PENDING", name: "Process Pending - Outbound"},
	// {value: "ACH_OUTBOUND_PROCESS_FAILURE", name: "Process Failure - Outbound"},
	{value: "BULKFILE_PROCESS_PENDING", name: "Bulk Payment Files"},
	// {value: "BULKFILE_PROCESS_PENDING", name: "Process Pending - Bulkfile"},
	// {value: "BULKFILE_PROCESS_FAILURE", name: "Process Failure - Bulkfile"},
	{value: "PAYMENT_FAILURE", name: "Payment Failure"},
	{value: "STUCK_PAYMENTS", name: "Stuck Payments"},
	// {value: "NOTIFICATION_FAILURE", name: "Notification Failure"},
	// {value: "NOTIFICATION_PENDING_DELIVERY", name: "Notification Pending Delivery"},
	{value: "NOTIFICATIONS", name: "Notification Issues"},
	{value: "JOB_EXECUTION_FAILURE", name: "Job Execution Failure"},

	{value: "PASSWORD_EXPIRATION", name: "Password Expiration"},
	{value: "UPSTREAM_CONNECTIONS", name: "Upstream Connections"},
	{value: "VPN_STATUS", name: "VPN Status"},
	// {value: "SCHEDULED_MAINTENANCE", name: "Scheduled Maintenance"},
	{value: "MESSAGE_FAILURES", name: "Real Time Message Issues"},
]; // dropdown

export const pageTypes = {
	ssl: "ssl_expirations",
	rtExceptions: "rt_exceptions",
	prodIssues: "prod_issues",
	serverHealth: "server_health",
	appProcessHealth: "app_process_health",
	mqHealth: "mq_health",
	achInbound: "ach_inbound",
	achOutbound: "ach_outbound",
	bulk: "bulkfile",
	paymentFailure: "payment_failure",
	stuckPayments: "stuck_payments",
	notification: "notification",
	job: "job",

	passExp: "pass_exp",
	upConns: "up_conns",
	vpnStatus: "vpn_status",
	// schedMaint: "sched_maint",
	rtMsg: "rt_messaging"
}; // url to request

export const dbTypeToUIType = {
	// Deneral
	RUNTIME_EXCEPTIONS: 'rt_exceptions',
	PROD_ISSUES: 'prod_issues',
	SERVER_HEALTH: 'server_health',
	APP_PROCESS_HEALTH: 'app_process_health',
	
	// Payments
	ACH_INBOUND_PROCESS_PENDING: 'ach_inbound',
	ACH_INBOUND_PROCESS_FAILURE: 'ach_inbound',
	ACH_INBOUND_UNKOWN_RTN: 'ach_inbound',
	ACH_OUTBOUND_PROCESS_PENDING: 'ach_outbound',
	ACH_OUTBOUND_PROCESS_FAILURE: 'ach_outbound',
	BULKFILE_PROCESS_PENDING: 'bulkfile',
	BULKFILE_PROCESS_FAILURE: 'bulkfile',
	PAYMENT_FAILURE: 'payment_failure',
	STUCK_PAYMENTS: 'stuck_payments',
	
	// Infrastructure
	SSL_EXPIRATIONS: 'ssl_expirations',
	MQ_HEALTH: 'mq_health',
	PASSWORD_EXPIRATION: "pass_exp",
	UPSTREAM_CONNECTIONS: "up_conns",
	VPN_STATUS: "vpn_status",
	// SCHEDULED_MAINTENANCE: "sched_maint",
	MESSAGE_FAILURES: "rt_messaging",

	// Other
	// NOTIFICATION_FAILURE: 'notification',
	// NOTIFICATION_PENDING_DELIVERY: 'notification',
	NOTIFICATIONS: 'notification',
	JOB_EXECUTION_FAILURE: 'job',
}; // Increase Count(unused)