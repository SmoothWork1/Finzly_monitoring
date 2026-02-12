
const mysql = require("mysql2");
const { v4: uuidv4 } = require("uuid");
const crypto = require('crypto');
const dbHelper = require('/opt/modules/common/mysql_helper.js');
//const NOTIFICATION_API_URL = 'https://api-bankos.finzly.io/notifications/adhoc_notification';
//const API_KEY = '2LMhDB6dQp8cRhJfkKbsI4AJJHZxa8R39yLFxj7u';
//const DEVOPS_EMAIL = 'murthy@finzly.com';
const {NOTIFICATION_API_URL,API_KEY,DEVOPS_EMAIL,STAGE} = process.env;
exports.createEventId = async (tenant_name,event_title ) => {
    var todayDate = new Date().toISOString().slice(0, 10);
    var name = `${tenant_name}-${event_title}-${todayDate}`;
    var hash = crypto.createHash('md5').update(name).digest('hex');
    return hash;
};
exports.create_connection_with_monitoring_db = async (stage, awsManager) => {
    try{
        const tenant_name = 'finzly';
        const baseParamDB = `/config/bankos/global_${stage}/bankos.monitoring.tenant.${tenant_name}.db.`;
	    const dbHostKey = `${baseParamDB}host`;
        const dbPortKey = `${baseParamDB}port`;
        const dbUserKey = `${baseParamDB}username`;
        const dbPassKey = `${baseParamDB}password`;
        let requiredParams = [dbHostKey, dbPortKey, dbUserKey, dbPassKey];

        const storeParams = await awsManager.getStoreParameters(requiredParams);
        if (!storeParams) {
            return;
        } else {
            const paramObj = await awsManager.objectifyParams(storeParams);
            const connection = mysql.createConnection({
                host: paramObj[dbHostKey],
                port: paramObj[dbPortKey],
                user: paramObj[dbUserKey],
                password: paramObj[dbPassKey]
                //database:`finzly_configserver_${STAGE}`,
            });

            return connection;
        }
    }catch(ex){
        console.log(ex);
    }
}
exports.create_connection_with_tenant_db = async (stage, tenant_name, awsManager) => {   
    const baseParamDB = `/config/bankos/global_${stage}/bankos.tenant.${tenant_name}.db.`;
    const dbHostKey = `${baseParamDB}host`;
    const dbPortKey = `${baseParamDB}port`;
    const dbUserKey = `${baseParamDB}username`;
    const dbPassKey = `${baseParamDB}password`;
    //console.log('baseParamDB :', baseParamDB)
    let requiredParams = [dbHostKey, dbPortKey, dbUserKey, dbPassKey];
    const paramsFormStore = await awsManager.getStoreParameters(requiredParams);
    if (!paramsFormStore) {
        return;
    }
    else {
        const paramObj = await awsManager.objectifyParams(paramsFormStore);
        //console.log('paramObj :', paramObj)
        const connection = mysql.createConnection({
            host: paramObj[dbHostKey],
            port: paramObj[dbPortKey],
            user: paramObj[dbUserKey],
            password: paramObj[dbPassKey]
        });
        return connection;
    }
}
exports.get_parameter_with_tenant = async (stage, tenant_name, awsManager) => {   
    const properties = await this.getConfigProperties(awsManager, stage);
    const params = {
        host: properties.config_db_host,
        port: properties.config_db_port,
        user: properties.config_db_user,
        password: properties.config_db_password,
        //database:`finzly_configserver_${STAGE}`,
        timeout: 60000
    }
    connection = awsManager.mysql.createConnection(params);
    console.log(`Fetching configured tenant list in ${stage}`);

    const TENANTS_KEY1 = `bankos.scheduler.tenant.${tenant_name}.url`;
    const TENANTS_KEY2 = `bankos.scheduler.tenant.${tenant_name}.username`;
    
    const query1 = `SELECT value FROM finzly_configserver_${stage}.properties WHERE prop_key='${TENANTS_KEY1}' and profile='${stage.toUpperCase()}'`;
    const result1 = await this.query(query1, connection);
    if(!result1) {
        return;
    }
    const url = result1[0].value;

    const query2 = `SELECT value FROM finzly_configserver_${stage}.properties WHERE prop_key='${TENANTS_KEY2}' and profile='${stage.toUpperCase()}'`;
    const result2 = await this.query(query2, connection);
    if(!result2) {
        return;
    }
    const username = result2[0].value;

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
            url: url,
            username: username,
            password: paramObj[apiPassKey]
        };
    }
}
exports.getConfigProperties = async (awsManager, stage) => {
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
    // convert paramters array to object for easy and quick access to required values
    const paramObj = await awsManager.objectifyParams(paramsFormStore);
    return {config_db_host: paramObj[dbHostKey],config_db_port: paramObj[dbPortKey],config_db_user: paramObj[dbUserKey],config_db_password: paramObj[dbPassKey]};
}
exports.addDays = async(date, days) => {
    try{
        var result = date.setDate(date.getDate() + days);
        return new Date(result);
    }catch(err){
        console.log(err)
    }
    return null;
}
exports.getStoreParameters = async function(Names,SSM) {
    const params = {
        Names,
        WithDecryption: true
    };
    return SSM.getParameters(params).promise()
    .then( (data) => {
        console.log("Parameters: ", data.Parameters.map( (p) => p.Name));
        console.log("Keys: ", Names);
        console.log("Length Check: ", data.Parameters.length, Names.length);
        if(data.Parameters.length === Names.length) {
            return data.Parameters; // [{ Name, Type, Value, Version, Selector, SourceResult, LastModifiedDate, ARN, DataType }]
        } else {
            if(data.Parameters.length) {
                console.log("Failure to fetch some parameters");
            } else {
                console.log("Failure to fetch all parameters");
            }
            return false;
        }
    }).catch( (err) => {
        console.log("Get parameters error: ", err);
        return false;
    });
};
exports.objectifyParams = function(Parameters) {
    let obj = {};
    for(let i = 0; i <= Parameters.length; ++i) {
        if(i === Parameters.length) {
            return obj;
        } else {
            obj[Parameters[i].Name] = Parameters[i].Value;
        }
    }
};
exports.sendExpirationSQSMessageJSON = function (obj,queueUrl,SQS) {
    return new Promise((resolve, reject) => {
        SQS.sendMessage({			
            MessageBody: JSON.stringify(obj),
            QueueUrl: queueUrl
        }, (err, data) => {
            if (err) {
                console.log(`MONITORING_SQS failed: `, err);
                resolve(false);
                return;
            }
            console.log(`MONITORING_SQS sent successfully`);
            resolve(true);
        });
    });
};
exports.query = async (qry, connection) => {
    return new Promise((resolve,reject) => {
        connection.query(qry, function(err,results,fields){
            if(err){
                console.log(err.message);
                return reject(err)
            }
            return resolve(results);
        });
    });
};
exports.insert = async (qry,vals,connection) => {
    return new Promise((resolve,reject) => {
        connection.query(qry,vals,function(err,results,fields){
            if(err){
                console.log(err.message);
                return reject(err)
            }
            return resolve(results);
        });
    });
};
exports.register_heartbeat = async (url,apikey,awsManager,event_id,source_system,description) => {
    const headers = {
        'x-api-key': apikey
      };
      try{
        const date = new Date();
        const executed_on = date.toLocaleString('en-US', {timeZone: 'America/New_York',})
        const obj = {
            event_id: event_id,
            source_system: source_system,
            description: description,
            executed_on: executed_on
        }
        var resp = await awsManager.axios.post(url, obj, {headers});
      }catch(err){
        console.log(err);
      }
};
exports.notify_monitoring_service = async (url,apikey,awsManager,obj) =>{
    const headers = {
      'x-api-key': apikey
    };
    try{
      var resp = await awsManager.axios.post(url, obj, {headers});
      console.log(resp);
    }catch(err){
      
    }
    
}
exports.getQueueUrl = async(queue_name, SQS) => {
    try{
        const data = await SQS.getQueueUrl({QueueName: queue_name}).promise();
        return data.QueueUrl;
    }catch(err){
        console.log(err)
    }
    return null;
};
exports.fetchActiveTenants = async (STAGE, awsManager) => {
    var tenants = null;
    var connection = null;
    var all_tenants = [];
    try{
        const properties = await this.getConfigProperties(awsManager, STAGE);
        const params = {
            host: properties.config_db_host,
            port: properties.config_db_port,
            user: properties.config_db_user,
            password: properties.config_db_password,
            //database:`finzly_configserver_${STAGE}`,
            timeout: 60000
        }
        connection = awsManager.mysql.createConnection(params);
        var stage_1 = STAGE.toLowerCase();
        var stage1_tenants = await this.fetchActiveTenantsByStage(stage_1,connection);
        if(stage1_tenants && stage1_tenants.length > 0) {
            console.log(`Stage_1 Tenants:${stage1_tenants}`);
            all_tenants.push({"stage":stage_1,tenants:stage1_tenants});
        }
        
        var stage_2 = "";
        if('prod' == stage_1){
            stage_2 = "prod2"
        }else if('dr' == stage_1){
            stage_2 = "dr2"
        }
        
        var stage2_tenants = await this.fetchActiveTenantsByStage(stage_2,connection);
        if(stage2_tenants && stage2_tenants.length > 0) {
            console.log(`Stage_2 Tenants:${stage2_tenants}`);
            all_tenants.push({"stage":stage_2,tenants:stage2_tenants});
        }
    }catch (e) {
        console.log(e);
    }finally{
        if (connection && connection.end) {
            connection.end();
        }
    }
    return all_tenants;
};
exports.fetchActiveTenantsByStage = async (STAGE,connection) => {
    var tenants = null;
    try{
        console.log(`Fetching configured tenant list in ${STAGE}`);
        const TENANTS_KEY = 'bankos.tenants';
        const qry = `SELECT value from finzly_configserver_${STAGE}.properties where prop_key = '${TENANTS_KEY}' and profile='${STAGE.toUpperCase()}'`;
        const results = await this.query(qry,connection);
        tenants = results[0].value.split(',');
        console.log(`tenants:${tenants}`);
    }catch (e) {
        console.log(e);
    }
    return tenants;
};
exports.getConfigPropertiesByKeys = async (keys,stage,awsManager) => {
    let requiredParams = keys;
    // fetch store parameters, stop lambda execution if failed
    const paramsFormStore = await awsManager.getStoreParameters(requiredParams);
    if(!paramsFormStore){
        console.log('Not able to read the config server properties from parameter store');
        return;
    }
    // convert paramters array to object for easy and quick access to required values
    const values = await awsManager.objectifyParams(paramsFormStore);
    return values;
};
exports.notify_failure = async (awsManager,source_id,description) => {
    const emailSubs = [DEVOPS_EMAIL];
    const b64Desc = Buffer.from(`${source_id} - ${description}`).toString('base64');
    await awsManager.axios.post(`${NOTIFICATION_API_URL}/adhoc_notification`, {
        "tenantName": "finzly",
        "notificationType": "EmailMonitoringAlert",
        "sourceId": "Monitoring",
        "sourceType": "Faild Execution",
        "content": b64Desc,
        "sourceObj": {},
        "moreInfo": {
            adhoc: true,
            subject: `CRITICAL (${STAGE.toUpperCase()}): Monitoring Alert - Execution failure`,
            notificationMethod: 'EMAIL',
            to: emailSubs
        }
    },{headers:{
        'Content-Type':'application/json',
        'x-api-key':API_KEY
    }});
}
exports.fetch_queries = async (condition,connection) => {
    const qry = `select * from galaxy_monitoring.monitoring_agent_queries where ${condition}`;
    console.log(`${qry}`);
    const results = await this.query(qry,connection);
    /*const records = []
    if(results){
        for(const result of results){

            records.push({
                "Tenant":tenant_name,
                "Status":result.status,
                "Count":result.count,
                "PaymentIds":result.paymentIds
            });
        }
    }
    return records
    */
   return results;
};