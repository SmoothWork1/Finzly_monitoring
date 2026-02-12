const Joi = require("joi");
const AWS = require('aws-sdk');
const moment = require('moment');
const crypto = require("crypto");
exports.heartbeatType = "HEART_BEAT";
const dbConnector = require('/opt/modules/common/mysql_conn.js');
const dbHelper = require('/opt/modules/common/mysql_helper.js');

exports.create_db_connection = async (stage, tenant_name, awsManager) => {
    tenant_name='finzly';
    //const conn = await this.create_connection_with_monitoring_db(stage,awsManager);
    //return conn;
    //const baseParamDB = `/config/bankos/global_${stage}/bankos.tenant.${tenant_name}.db.`;
    const baseParamDB = `/config/bankos/global_${stage}/bankos.monitoring.tenant.${tenant_name}.db.`;
    const dbHostKey = `${baseParamDB}host`;
    const dbPortKey = `${baseParamDB}port`;
    const dbUserKey = `${baseParamDB}username`;
    const dbPassKey = `${baseParamDB}password`;
    const storeParams = await awsManager.getStoreParameters([dbHostKey,dbPortKey,dbUserKey,dbPassKey]);
    if (!storeParams) {
         return;
    } else {
        const paramObj = await awsManager.objectifyParams(storeParams);
        console.log(paramObj);
        //  awsManager.connectDB(paramObj[dbHostKey], paramObj[dbUserKey], paramObj[dbPassKey], '', paramObj[dbPortKey]);
        const dbConnection = dbConnector(paramObj[dbHostKey], paramObj[dbUserKey], paramObj[dbPassKey], '', paramObj[dbPortKey]);
        return (new dbHelper(dbConnection));
    }
    // const dbConnection = dbConnector('finzly-monitoring-poc-server.czg2s2mwecx0.us-east-1.rds.amazonaws.com', 'monitoring_user_poc', 'IoMjx4z0hkO0VED', '', '3309');
    // return (new dbHelper(dbConnection));
}

exports.create_db_connection_with_config = async (awsManager,stage) => {
    const baseParamDB = `/config/bankos/global_${stage}/bankos.config_server.db.`;
    // DB parameter keys
    const dbHostKey = `${baseParamDB}host`;
    const dbPortKey = `${baseParamDB}port`;
    const dbUserKey = `${baseParamDB}username`;
    const dbPassKey = `${baseParamDB}password`;
    let requiredParams = [dbHostKey,dbPortKey,dbUserKey,dbPassKey];
    // fetch store parameters, stop lambda execution if failed
    const paramsFormStore = await awsManager.getStoreParameters(requiredParams);
    if(!paramsFormStore){
        console.log('Not able to read the config server properties from parameter store');
        return;
    }
    else {
        // convert paramters array to object for easy and quick access to required values
        const paramObj = await awsManager.objectifyParams(paramsFormStore);
        const dbConnection = dbConnector(paramObj[dbHostKey], paramObj[dbUserKey], paramObj[dbPassKey], '', paramObj[dbPortKey]);
        return (new dbHelper(dbConnection));
    }
}


exports.get_parameter_with_tenant = async (stage, tenant_name, awsManager) => {   
    const baseParamDB = `/config/bankos/global_${stage}/bankos.scheduler.tenant.${tenant_name}.`;
    const apiPassKey = `${baseParamDB}password`;

    let requiredParams = [apiPassKey];
    const paramsFormStore = await awsManager.getStoreParameters(requiredParams);
    if (!paramsFormStore) {
        return;
    }
    else {
        const paramObj = await awsManager.objectifyParams(paramsFormStore);
        return {
            password: paramObj[apiPassKey]
        };
    }
}

exports.sendMessageToClient = (url, connectionId, payload) => {
    return new Promise((resolve, reject) => {
        const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
            apiVersion: '2018-11-29',
            endpoint: url,
        });
        apigatewaymanagementapi.postToConnection(
            {
                ConnectionId: connectionId, // connectionId of the receiving ws-client
                Data: JSON.stringify(payload),
            },
            (err, data) => {
                if (err) {
                    // console.log('Websocket send message error: ', err);
                    reject(err);
                }
                resolve(data);
            }
        );
    });
}

exports.sortDashboardTotals = (statuses) => {
    let totals = {};
    for(let i = 0; i <= statuses.length; ++i) {
        if(i === statuses.length) {
            return totals;
        } else {
            totals[statuses[i].status] = statuses[i].total;
        }
    }
}

exports.get_monitoring_notification_schema = () => {
    return Joi.object().keys({
        event_id: Joi.string().required(),
        source_system: Joi.string().required(),
        tenant_name: Joi.string().required(),
        description: Joi.string().required(),
        details: Joi.string().required(),
        severity: Joi.string().optional().allow(''),
        event_type: Joi.string().valid(
            "SSL_EXPIRATIONS",
            "RUNTIME_EXCEPTIONS",
            "PROD_ISSUES",
            "SERVER_HEALTH",
            "APP_PROCESS_HEALTH",
            "MQ_HEALTH",
            "ACH_INBOUND_PROCESS_PENDING",
            "ACH_INBOUND_PROCESS_FAILURE",
            "ACH_INBOUND_UNKOWN_RTN",
            "ACH_OUTBOUND_PROCESS_PENDING",
            "ACH_OUTBOUND_PROCESS_FAILURE",
            "BULKFILE_PROCESS_PENDING",
            "BULKFILE_PROCESS_FAILURE",
            "PAYMENT_FAILURE",
            "STUCK_PAYMENTS",
            // "NOTIFICATION_FAILURE",
            // "NOTIFICATION_PENDING_DELIVERY",
            "NOTIFICATIONS",
            "JOB_EXECUTION_FAILURE",
            "PASSWORD_EXPIRATION",
            "UPSTREAM_CONNECTIONS",
            "VPN_STATUS",
            // "SCHEDULED_MAINTENANCE",
            "MESSAGE_FAILURES"
        ).required(),
    });
}
exports.get_heartbeat_notification_schema = () => {
    return Joi.object().keys({
        source_system: Joi.string().required(),
        tenant_name: Joi.string().required(),
        description: Joi.string().required(),
        executed_on: Joi.string().required(),
        event_type: Joi.string().required(),
        event_id: Joi.string().valid(
            "SSL_EXPIRATIONS",
            "RUNTIME_EXCEPTIONS",
            "PROD_ISSUES",
            "SERVER_HEALTH",
            "APP_PROCESS_HEALTH",
            "MQ_HEALTH",
            "ACH_INBOUND_PROCESS_PENDING",
            "ACH_INBOUND_PROCESS_FAILURE",
            "ACH_INBOUND_UNKOWN_RTN",
            "ACH_OUTBOUND_PROCESS_PENDING",
            "ACH_OUTBOUND_PROCESS_FAILURE",
            "BULKFILE_PROCESS_PENDING",
            "BULKFILE_PROCESS_FAILURE",
            "PAYMENT_FAILURE",
            "STUCK_PAYMENTS",
            // "NOTIFICATION_FAILURE",
            // "NOTIFICATION_PENDING_DELIVERY",
            "NOTIFICATIONS",
            "JOB_EXECUTION_FAILURE",
            "PASSWORD_EXPIRATION",
            "UPSTREAM_CONNECTIONS",
            "VPN_STATUS",
            // "SCHEDULED_MAINTENANCE",
            "MESSAGE_FAILURES"
        ).required(),
    });
}
exports.get_user_schema = () => {
    return Joi.object().keys({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        address: Joi.string().required(),
        type: Joi.string().optional().allow(''),
        devops_type: Joi.string().optional().allow(''),
        contact_number: Joi.string().regex(/^\d{11,12}$/).required(),
        // tenant_name: Joi.string().required(),
    });
}
exports.get_create_user_schema = () => {
    return Joi.object().keys({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        address: Joi.string().required(),
        type: Joi.string().optional().allow(''),
        devops_type: Joi.string().optional().allow(''),
        tenant_id: Joi.string().optional().allow(''),
        contact_number: Joi.string().regex(/^\d{11,12}$/).required(),
        // tenant_name: Joi.string().required(),
    });
}
exports.get_update_user_schema = () => {
    return Joi.object().keys({
        id: Joi.string().required(),
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().required(),
        // password: Joi.string().required(),
        address: Joi.string().required(),
        type: Joi.string().optional().allow(''),
        devops_type: Joi.string().optional().allow(''),
        tenant_id: Joi.string().optional().allow(''),
        contact_number: Joi.string().regex(/^\d{11,12}$/).required(),
        // tenant_name: Joi.string().required(),
    });
}
exports.get_remove_user_schema = () => {
    return Joi.object().keys({
        email: Joi.string().required(),
    });
}
exports.get_event_schema = () => {
    return Joi.object().keys({
        name: Joi.string().required(),
        configuration: Joi.string().required(),
        application: Joi.string().required(),
        platform: Joi.string().required(),
        event_type: Joi.string().required(),
    });
}
exports.get_create_event_schema = () => {
    return Joi.object().keys({
        name: Joi.string().required(),
        configuration: Joi.string().required(),
        application: Joi.string().required(),
        platform: Joi.string().required(),
        event_type: Joi.string().required(),
    });
}
exports.get_update_event_schema = () => {
    return Joi.object().keys({
        id: Joi.string().required(),
        name: Joi.string().required(),
        configuration: Joi.string().required(),
        application: Joi.string().required(),
        platform: Joi.string().required(),
        event_type: Joi.string().required()
    });
}
exports.get_remove_event_schema = () => {
    return Joi.object().keys({
        id: Joi.string().required(),
    });
}
exports.get_jobconfig_schema = () => {
    return Joi.object().keys({
        job_id: Joi.string().required(),
        flow_id: Joi.string().required(),
        tenant_id: Joi.string().required(),
        cron: Joi.string().required(),
        active: Joi.string().required(),
    });
}
exports.get_create_jobconfig_schema = () => {
    return Joi.object().keys({
        job_id: Joi.string().required(),
        flow_id: Joi.string().required(),
        tenant_id: Joi.string().required(),
        cron: Joi.string().required(),
        active: Joi.string().required(),
    });
}
exports.get_update_jobconfig_schema = () => {
    return Joi.object().keys({
        id: Joi.string().required(),
        job_id: Joi.string().required(),
        flow_id: Joi.string().required(),
        tenant_id: Joi.string().required(),
        cron: Joi.string().required(),
        active: Joi.string().required(),
    });
}
exports.get_remove_jobconfig_schema = () => {
    return Joi.object().keys({
        id: Joi.string().required(),
    });
}
exports.get_devops_request_schema = () => {
    return Joi.object().keys({
        // serial_number: Joi.string().required(),
        execution_date: Joi.string().required(),
        // requester: Joi.string().required(),
        command: Joi.string().required(),
        // status: Joi.string().required(),
    });
}
exports.get_update_devops_request_schema = () => {
    return Joi.object().keys({
        id: Joi.string().required(),
        // serial_number: Joi.string().required(),
        execution_date: Joi.string().required(),
        // requester: Joi.string().required(),
        command: Joi.string().required(),
        // status: Joi.string().required(),
    });
}
exports.convertEventTypesToQueryCondition = (key, event_types) => {
    const conditions = event_types.map( (et) => this.convertEventTypeToQueryCondition(et, key) );
    return conditions.join(" OR ");
};
exports.convertEventTypeToQueryCondition = (event_type, key) => {
    switch(event_type) {
        // Deneral
        case 'rt_exceptions':
            return `${key} = 'RUNTIME_EXCEPTIONS'`;
        case 'prod_issues':
            return `${key} = 'PROD_ISSUES'`;
        case 'server_health':
            return `${key} = 'SERVER_HEALTH'`;
        case 'app_process_health':
            return `${key} = 'APP_PROCESS_HEALTH'`;

        // Payments
        case 'ach_inbound':
            return `(${key} = 'ACH_INBOUND_PROCESS_PENDING' OR ${key} = 'ACH_INBOUND_PROCESS_FAILURE' OR ${key} = 'ACH_INBOUND_UNKOWN_RTN')`;
        case 'ach_outbound':
            return `(${key} = 'ACH_OUTBOUND_PROCESS_PENDING' OR ${key} = 'ACH_OUTBOUND_PROCESS_FAILURE')`
        case 'ach_failure':
            return `(${key} = 'ACH_INBOUND_PROCESS_PENDING' OR ${key} = 'ACH_INBOUND_PROCESS_FAILURE' OR ${key} = 'ACH_INBOUND_UNKOWN_RTN' OR ${key} = 'ACH_OUTBOUND_PROCESS_PENDING' OR ${key} = 'ACH_OUTBOUND_PROCESS_FAILURE')`
        case 'bulkfile':
            return `(${key} = 'BULKFILE_PROCESS_PENDING' OR ${key} = 'BULKFILE_PROCESS_FAILURE')`;
        case 'payment_failure':
            return `${key} = 'PAYMENT_FAILURE'`;
        case 'stuck_payments':
            return `${key} = 'STUCK_PAYMENTS'`;
            
        // Infrastructure
        case 'ssl_expirations':
            return `${key} = 'SSL_EXPIRATIONS'`;
        case 'mq_health':
            return `${key} = 'MQ_HEALTH'`;
        case 'pass_exp':
            return `${key} = 'PASSWORD_EXPIRATION'`;
        case 'up_conns':
            return `${key} = 'UPSTREAM_CONNECTIONS'`;
        case 'vpn_status':
            return `${key} = 'VPN_STATUS'`;
        case 'sched_maint':
            return `${key} = 'SCHEDULED_MAINTENANCE'`;
        case 'rt_messaging':
            return `${key} = 'MESSAGE_FAILURES'`;

        // Other
        case 'notification':
            // return `(${key} = 'NOTIFICATION_FAILURE' OR ${key} = 'NOTIFICATION_PENDING_DELIVERY')`;
            return `${key} = 'NOTIFICATIONS'`;
        case 'job':
            return `${key} = 'JOB_EXECUTION_FAILURE'`;
        default:
            return "";
    }
};

exports.get_subscription_schema = () => {
    return Joi.object().keys({
        user_id: Joi.string().required(),
        event_type: Joi.string().required(),
        delivery_method: Joi.string().required(),
        deliver_to: Joi.string().required(),
        tenant_name: Joi.string().optional().allow(''),
    });
}

exports.get_update_subscription_schema = () => {
    return Joi.object().keys({
        subscription_id: Joi.string().required(),
        user_id: Joi.string().required(),
        event_type: Joi.string().required(),
        delivery_method: Joi.string().required(),
        deliver_to: Joi.string().required(),
        tenant_name: Joi.string().optional().allow(''),
    });
}

exports.get_flagged_event_schema = () => {
    return Joi.object().keys({
        user_id: Joi.string().required(),
        description_substring: Joi.string().required(),
    });
}

exports.get_update_flagged_event_schema = () => {
    return Joi.object().keys({
        flagged_id: Joi.string().required(),
        user_id: Joi.string().required(),
        description_substring: Joi.string().required(),
    });
}

const dbTypeToUIType = {
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
	PASSWORD_EXPIRATION: 'pass_exp',
	UPSTREAM_CONNECTIONS: 'up_conns',
	VPN_STATUS: 'vpn_status',
	// SCHEDULED_MAINTENANCE: "sched_maint",
	MESSAGE_FAILURES: "rt_messaging",

	// Other
	// NOTIFICATION_FAILURE: 'notification',
	// NOTIFICATION_PENDING_DELIVERY: 'notification',
	NOTIFICATIONS: 'notification',
	JOB_EXECUTION_FAILURE: 'job',
};

exports.sortEventTypeCounts = (events) => {
    let types = {};
    for(let i = 0; i <= events.length; ++i) {
        if(i === events.length) {
            return types;
        } else {
            const type = dbTypeToUIType[events[i].event_type];
            if(types[type]) {
                types[type] += events[i].count;
                continue;
            }
            types[type] = events[i].count;
        }
    }
}

const dbTypeToUIType2 = {
	// Deneral
	PROD_ISSUES: 'prod_issues',
	SERVER_HEALTH: 'server_health',
    RUNTIME_EXCEPTIONS: 'rt_exceptions',
	APP_PROCESS_HEALTH: 'app_process_health',
	
	// Payments
	ACH_INBOUND_PROCESS_PENDING: 'ach_failure',
	ACH_INBOUND_PROCESS_FAILURE: 'ach_failure',
	ACH_INBOUND_UNKOWN_RTN: 'ach_failure',
	ACH_OUTBOUND_PROCESS_PENDING: 'ach_failure',
	ACH_OUTBOUND_PROCESS_FAILURE: 'ach_failure',
	PAYMENT_FAILURE: 'payment_failure',
	STUCK_PAYMENTS: 'stuck_payments',
	
	// Infrastructure
	SSL_EXPIRATIONS: 'ssl_expirations',
    MQ_HEALTH: 'mq_health',
	PASSWORD_EXPIRATION: 'pass_exp',
	UPSTREAM_CONNECTIONS: 'up_conns',
	VPN_STATUS: 'vpn_status',
	// SCHEDULED_MAINTENANCE: "sched_maint",
	MESSAGE_FAILURES: "rt_messaging",

	// Payments
	BULKFILE_PROCESS_PENDING: 'bulkfile',
	BULKFILE_PROCESS_FAILURE: 'bulkfile',

	// Other
	// NOTIFICATION_FAILURE: 'notification',
	// NOTIFICATION_PENDING_DELIVERY: 'notification',
	NOTIFICATIONS: 'notification',
	JOB_EXECUTION_FAILURE: 'job',
};

exports.safelyParseJSONObj = (str) => {
	try {
		return JSON.parse(str);
	} catch(e) {
		return {};
	}
};

exports.sortEventTypeBlocks = (events) => {
    let types = {};
    for(let i = 0; i <= events.length; ++i) {
        if(i === events.length) {
            return types;
        } else {
            const type = dbTypeToUIType2[events[i].event_type];
            if(Array.isArray(types[type])) {
                types[type].push(events[i]);
                continue;
            }
            types[type] = [events[i]];
        }
    }
}

exports.sortEventTypeBlockCounts = (events) => {
    let types = {};
    for(let i = 0; i <= events.length; ++i) {
        if(i === events.length) {
            return types;
        } else {
            const type = dbTypeToUIType2[events[i].event_type];
            if(types[type]) {
                types[type] += events[i].count;
                continue;
            }
            types[type] = events[i].count;
        }
    }
}

exports.createEventId = async (tenant_name, event_title) => {
    var todayDate = new Date().toISOString().slice(0, 10);
    var name = `${tenant_name}-${event_title}-${todayDate}`;
    var hash = crypto.createHash('md5').update(name).digest('hex');
    return hash;
}

exports.get_agent_query_schema = () => {
    return Joi.object().keys({
        lambda_name: Joi.string().required(),
        query_name: Joi.string().required(),
        query: Joi.string().required(),
        query_result: Joi.string().allow(''),
        query_order: Joi.string().required(),
    });
}
exports.getFunctionSchedulesSchema = () => {
    return Joi.object().keys({
        functionArn: Joi.string().required(),
    });
}

exports.updateFunctionScheduleSchema = () =>{
    return Joi.object().keys({
        schedulerName: Joi.string().required(),
        expression: Joi.string().required()
    });
}

const getDaysArray = (start, end) => {
    for (
        var arr = [], dt = new Date(start);
        dt <= new Date(end);
        dt.setDate(dt.getDate() + 1)
    ) {
        arr.push(new Date(dt));
    }
    return arr;
}

exports.persentDays = (list, startMonth, currentMonth) => {
    const startDate = startMonth ? startMonth : moment().subtract(90, "days");
    const endDate = currentMonth ? currentMonth : moment();
    const dayList = getDaysArray(new Date(startDate), new Date(endDate));

    const datesPersent = dayList.filter(
        (day) =>
        !list.some(
            (item) =>
            moment(day).format("YYYY MM DD") ===
            moment(item.heartbeat).format("YYYY MM DD")
        )
    );
    const newResult = datesPersent.map((day) => {
        return {
        heartbeat: day,
        };
    });
    const newArr = newResult.concat(list);
    newArr.forEach((item) => {
        if (typeof item.heartbeat === "string") {
        item.heartbeat = new Date(item.heartbeat);
        }
    });
    return newArr.sort((a, b) => a.heartbeat - b.heartbeat);
}

exports.persentTodays = (list) => {
    const today = moment().startOf("day").toDate(); // get only today
    // Create a date object for today at start of day
    const todayStr = moment().format("YYYY MM DD"); // current day as string for matching
  
    const isTodayIncluded = list.some(item => 
      moment(item.heartbeat).format("YYYY MM DD") === todayStr
    );
  
    // If today's record isn't already in the list, add it
    if (!isTodayIncluded) {
      list.push({ heartbeat: new Date() });
    }
  
    // Convert 'heartbeat' to Date objects if they are strings
    list.forEach(item => {
      if (typeof item.heartbeat === "string") {
        item.heartbeat = new Date(item.heartbeat);
      }
    });
  
    // Sort by heartbeat date
    return list.sort((a, b) => a.heartbeat - b.heartbeat);
}