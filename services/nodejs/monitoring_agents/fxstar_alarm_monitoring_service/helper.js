const mysql = require("mysql2");
const { v4: uuidv4 } = require("uuid");

exports.create_connection_with_tenant_db = async (stage, tenant_name, awsManager) => {   
    const baseParamDB = `/config/bankos/global_${stage}/bankos.tenant.${tenant_name}.db.`;
    const dbHostKey = `${baseParamDB}host`;
    const dbPortKey = `${baseParamDB}port`;
    const dbUserKey = `${baseParamDB}username`;
    const dbPassKey = `${baseParamDB}password`;
    console.log('baseParamDB :', baseParamDB)
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
exports.query = async (qry,connection) => {
    return new Promise((resolve,reject) => {
        console.log(qry+";");
        connection.query(qry, function(err,results,fields){
            if(err){
                console.log(err.message);
                return reject(err)
            }
            return resolve(results);
        });
    });
}
exports.getCurrentDateTimeString = async() => {
    const date = new Date();
    return date.getFullYear() + '-' +
        (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
        date.getDate().toString().padStart(2, '0') + ':' +
        date.getHours().toString().padStart(2, '0') + ':' +
        date.getMinutes().toString().padStart(2, '0') + ':' +
        date.getSeconds().toString().padStart(2, '0');
}
exports.getQueueUrl = async(queue_name, SQS) => {
    try{
        const data = await SQS.getQueueUrl({QueueName: queue_name}).promise();
        return data.QueueUrl;
    }catch(err){
        console.log(err)
    }
    return null;
}
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
exports.invoke_sqs = async(msg_object, queue_name, awsManager) => {
    let messageGroupId = uuidv4();

    /*let message_body = {
        message_obj: msg_object
    }*/

    await awsManager.sendSQSMessageFIFO(JSON.stringify(msg_object), queue_name, messageGroupId, messageGroupId)
}
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
}