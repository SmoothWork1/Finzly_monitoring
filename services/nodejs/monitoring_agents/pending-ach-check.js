const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const AWS = require("aws-sdk");
const helper = require('./helper.js');
//const {LISTENED_BUCKET,MONITORING_SQS_NAME,CROSSACCOUNT_ID,CROSSACCOUNT_ROLE, STAGE } = process.env;
const {LISTENED_BUCKET,MONITORING_SQS_NAME, STAGE,REGION } = process.env;
const TENANTS_KEY = 'bankos.tenants';
const TENANT_RTN_KEY = 'bankos.tenants.TENANT_NAME_ID.rtns';
const BULKFILE_FOLDER = `bulkfiles`;
const INBOUND_ACH_FOLDER = `sftp/${STAGE.toUpperCase()}/INBOUND/`;
const ENCRYPTED_INBOUND_ACH_FOLDER = `sftp/encrypted/${STAGE.toUpperCase()}/INBOUND/`;
const OUTBOUND_ACH_FOLDER = `sftp/${STAGE.toUpperCase()}/OUTBOUND/`;
const MIN30_MILLI = 1800000; //30 mins in milli seconds
const MIN31 = 1860; //31 mins in sec;
const MONITORING_SERVICE_URL = process.env.MONITORING_SERVICE_URL;
const API_KEY = process.env.API_KEY;
class NotifyPendingOutboundACHFiles extends BaseHandler {
    /*
    Bulkfile Folder:
            bankos-dev-payment-filetransfer/$tenant_id/$legalentity_id/$sftp_account_id/bulkfiles/$file_type/$file_name
    Outbound ACH Folder:
            bankos-dev-payment-filetransfer/sftp/DEV/OUTBOUND/$tenant_id/$file_name
    Inbound ACH Folder:
            bankos-dev-payment-filetransfer/sftp/DEV/INBOUND/$rtn/$file_name
    */
    constructor() {
        super();
    }
    query = (qry, connection, data) => {
        return new Promise((resolve, reject) => {
            console.log(qry + ";");
            if (data) {
                connection.query(qry, data, function (err, results, fields) {
                    if (err) {
                        console.log(err.message);
                        console.log("***********Query: " + qry + " has a problem***********");
                        return reject(err)
                    }
                    return resolve(results);
                });
            } else {
                connection.query(qry, function (err, results, fields) {
                    if (err) {
                        console.log(err.message);
                        return reject(err)
                    }
                    return resolve(results);
                });
            }
        });
    }
    runSQL = async (input, qry, data) => {
        let connection;
        let results;
        var params = {
            host: input.host,
            port: input.port,
            user: input.user,
            password: input.password,
            //database:db_info.database,
            timeout: 60000
        }
        /* if(db_info.database != null){
             params.database = db_info.database;
         }*/
        try {
            connection = input.mysql.createConnection(params);
            results = await this.query(qry, connection, data);
        } catch (err) {
            console.log(err);
        } finally {
            if (connection && connection.end)
                connection.end();
        }
        return results;
    }
    fetchDBTenants = async (input) => {
        var tenants = null;
        const qry = `SELECT value from finzly_configserver_${STAGE}.properties where prop_key = '${TENANTS_KEY}' and profile='${STAGE.toUpperCase()}'`;
        try {
            let results = await this.runSQL(input, qry, null);
            tenants = results[0].value.split(',');
            console.log(`tenants:${tenants}`);
            //tenants = results[0].split(',');

        } catch (e) {
            console.log(e);
        }
        return tenants;
    }
    fetchRTNsByTenant = async (input, tenantName) => {
        var rtns = null;
        var key = TENANT_RTN_KEY.replace(/TENANT_NAME_ID/g, tenantName);
        const qry = `SELECT * from finzly_configserver_${STAGE}.properties where prop_key = '${key}' and profile='${STAGE.toUpperCase()}'`;
        try {
            let results = await this.runSQL(input, qry, null);
            //rtns = results[0].split(',');
            if(results != null && results.length > 0){
                rtns = results[0].value.split(',')
                console.log(`RTNS:${rtns}`);
            }else{
                console.log(`No routing numbers found for tenant:${tenantName}`);
            }
        } catch (e) {
            console.log(e);
        }
        return rtns;
    }
    fetchActiveTenants = async (awsManager) => {
        const properties = await helper.getConfigProperties(awsManager,STAGE);
        const input = {
            mysql: awsManager.mysql,
            host: properties.config_db_host,
            port: properties.config_db_port,
            user: properties.config_db_user,
            password: properties.config_db_password,
            database:`finzly_configserver_${STAGE}`,
            timeout: 60000
        }
        console.log(`Fetching configured tenant list in ${STAGE}`);
        const tenants = await this.fetchDBTenants(input);
        return tenants;
    }
    tenantLookupByRTN = async (rtn,awsManager) => {
        let target_tenant = null;
        const properties = await helper.getConfigProperties(awsManager,STAGE);
        const input = {
            mysql: awsManager.mysql,
            host: properties.config_db_host,
            port: properties.config_db_port,
            user: properties.config_db_user,
            password: properties.config_db_password,
            database:`finzly_configserver_${STAGE}`,
            timeout: 60000
        }
        console.log(`Fetching configured tenant list in ${STAGE}`);
        const tenants = await this.fetchDBTenants(input);
        if(tenants){
            for(const tenant of tenants){
                console.log(`Fetching routing numbers for tenant: ${tenant}`);
                const rtns = await this.fetchRTNsByTenant(input,tenant);
                if(rtns != null){
                    if (rtns.includes(rtn)) {
                        target_tenant = tenant;
                        break;
                    }
                }
            }
        }
        return target_tenant;
    }
    unpack = async (event,context,awsManager) => {
        const file_name = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
        const bucket = decodeURIComponent(event.Records[0].s3.bucket.name.replace(/\+/g, ' '));
        //Check if file is a bulkfile, outbound or inbound ach file
        const processed_file_name = file_name.replace(/\\/g, "/");
        const keys = processed_file_name.split("/");
        const params = {
            bucket:bucket,
            file_name:file_name,
            processed_file_name:processed_file_name,
            tenantId:null,
            routing_number:null,
            file_type:null,
            is_bulkfile:false,
            is_outbound_ach:false,
            is_inbound_ach:false,
            is_valid_event:true,
            encrypted_file:null,
            error_desc:[]
        }
        if(keys){
            if(keys.indexOf('encrypted') > -1){
                params.is_valid_event = false;
                params.error_desc.push(`It is an encrypted file. Skip processing`);
            }else if(6 == keys.length){
                if(keys[6] && keys[6].trim.length == 0){
                    params.is_valid_event = false;
                    params.error_desc.push(`It is a folder. Skip processing`);
                }else{
                    //This could be a bulkfile
                    if(keys[3] != "bulkfiles"){
                        params.is_valid_event = false;
                        params.error_desc.push(`${processed_file_name} is not a bulk payment file. Expected file folder is: tenant_id/le_id/sftp_user_id/bulkfiles/file_types/file_name`);
                    }
                    if(['csv','ach','fedwire','rtp'].indexOf(keys[4]) == -1){
                        params.is_valid_event = false;
                        params.error_desc.push(`${processed_file_name} is not a bulk payment file. Expected file folder is: tenant_id/le_id/sftp_user_id/bulkfiles/file_types/file_name`);
                    }
                    if(params.is_valid_event){
                        params.tenantId = keys[0];
                        params.file_type = keys[4];
                        params.is_bulkfile = true;
                        params.encrypted_file = `encrypted/${processed_file_name}`;
                    }
                }

            }else if(5 == keys.length){
                //This could be a inbound or outbound ach
                if(keys[5] && keys[5].trim.length == 0){
                    params.is_valid_event = false;
                    params.error_desc.push(`It is a folder. Skip processing`);
                }else{
                    if(keys[0] != "sftp"){
                        params.is_valid_event = false;
                        params.error_desc.push(`${processed_file_name} is not a valid OUTBOUND ACH file . Expected file folder is: sftp/${STAGE.toUpperCase()}/OUTBOUND/$tenant_id/file_name`);
                        params.error_desc.push(`${processed_file_name} is not a valid INBOUND ACH file . Expected file folder is: sftp/${STAGE.toUpperCase()}/INBOUND/$routing_number/file_name`);                
                    }
                    if(keys[1] != STAGE.toUpperCase()){
                        params.is_valid_event = false;
                        params.error_desc.push(`${processed_file_name} is not a valid OUTBOUND ACH file . Expected file folder is: sftp/${STAGE.toUpperCase()}/OUTBOUND/$tenant_id/file_name`);
                        params.error_desc.push(`${processed_file_name} is not a valid INBOUND ACH file . Expected file folder is: sftp/${STAGE.toUpperCase()}/INBOUND/$routing_number/file_name`);                                   
                    }
                    if(['OUTBOUND','INBOUND'].indexOf(keys[2]) == -1){
                        params.is_valid_event = false;
                        params.error_desc.push(`${processed_file_name} is not a valid OUTBOUND ACH file . Expected file folder is: sftp/${STAGE.toUpperCase()}/OUTBOUND/$tenant_id/file_name`);
                        params.error_desc.push(`${processed_file_name} is not a valid INBOUND ACH file . Expected file folder is: sftp/${STAGE.toUpperCase()}/INBOUND/$routing_number/file_name`);
                    }
                    if(params.is_valid_event){
                        if('OUTBOUND' == keys[2]){
                            params.is_outbound_ach = true;
                            params.tenantId = keys[3];
                            params.encrypted_file = `${keys[0]}/encrypted/${keys[1]}/${keys[2]}/${keys[3]}/${keys[4]}`;
                        }else if('INBOUND' == keys[2]){
                            try{
                                const routing_number = keys[3];
                                console.log(`Finding tenant name for inbound file with routing number:${routing_number}`);
                                const tenant = await this.tenantLookupByRTN(routing_number,awsManager,SSM);
                                if(tenant){
                                    console.log(`Routing number:${routing_number} is mapped to tenant:${tenant}`)
                                    params.tenantId = tenant;
                                    params.is_inbound_ach = true;
                                    params.routing_number = routing_number
                                    params.encrypted_file = `${keys[0]}/encrypted/${keys[1]}/${keys[2]}/${keys[3]}/${keys[4]}`;
                                }else{
                                    //TODO: Raise an alert
                                    console.log(`Routing number:${routing_number} is not mapped to any tenant`);
                                    params.is_valid_event = false;
                                    params.error_desc.push(`Failed to find tenant associated with the routing number:${routing_number}`);
                                }
        
                            }catch(e){
                                console.log('Failed to find tenant associated with the routing number',e);
                                params.is_valid_event = false;
                                params.error_desc.push('Failed to find tenant associated with the routing number');
                            }
                        }
                    }
                }
            }else{
                params.is_valid_event = false;
                params.error_desc.push(`Folder structure doesn't match with bulkfile, outbound ach or inbound ach.`);
            }
        }else{
            params.is_valid_event = false;
            params.error_desc.push(`Folder structure doesn't match with bulkfile, outbound ach or inbound ach.`);
        }
        return params;
    }
    findFailedToTransmitACHFiles = async (awsManager,SQS) => {
        try{
            const queueUrl = await this.getQueueUrl(MONITORING_SQS_NAME,SQS);
            //const tenants = await this.fetchActiveTenants(awsManager);
            const all_tenants = await helper.fetchActiveTenants(STAGE,awsManager);
            for(const obj of all_tenants){
                const stg = obj.stage;
                for(const tenant_name of obj.tenants) {
                    if("finzly" == tenant_name){
                        continue;
                    }
                    console.log(`## Executing FAILED to TRANSMIT ACH FILES check for tenant:${tenant_name}`);
                    const qry = `select file_name as file_name, status as status from galaxy_ach_${tenant_name}.ach_file WHERE status in ('NEW','TRANSMISSION_FAILED') and  TIME_TO_SEC(timediff(now(), last_updated_time)) <= ${MIN31}`;
                    //const qry = `select group_concat(file_name) as files, count(*) as count from galaxy_ach_${tenant_name}.ach_file WHERE status='TRANSMISSION_FAILED' and  TIME_TO_SEC(timediff(now(), last_updated_time)) <= ${MIN31}`;
                    const connection = await helper.create_connection_with_tenant_db(stg, tenant_name, awsManager);
                    if (!connection) {
                        console.log(`Not able to read the ${tenant_name} database server properties from parameter store`);
                        continue;
                    }
                    const results = await helper.query(qry,connection);
                    if(results){
                        for(const result of results){    
                            const event_id = await helper.createEventId(tenant_name,result.file_name);
                            let obj = {
                                event_id:event_id,
                                event_type: 'ACH_OUTBOUND_PROCESS_PENDING',
                                source_system: `ACH`,
                                tenant_name: 'finzly',
                                details: JSON.stringify({
                                    "Tenant":tenant_name,
                                    "Status":result.status
                                }),
                                description:`Failed to transmit file: ${result.file_name}`
                            };
                            if (queueUrl) {
                                const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                                console.log(`Notification sent to monitoring system for failed to transmit file:${result.file_name}`);
                            }
                        }
                    }
                }
            }
        }catch(ex){
            console.log(ex);
        }
    }
    fetchUnProcessedBulkFiles = async (awsManager) => {
        //TODO Assume the role
        //BULKFILE_FOLDER
        const files = [];
        //const tenants = await this.fetchActiveTenants(awsManager);
        const all_tenants = await helper.fetchActiveTenants(STAGE,awsManager);
        for(const obj of all_tenants){
            const stg = obj.stage;
            for(const tenant of obj.tenants){
                if("finzly" == tenant){
                    continue;
                }
                var params = {
                    Bucket : LISTENED_BUCKET,
                    Prefix : tenant 
                };
                var data = await awsManager.s3.listObjects(params).promise();
                //var data = await S3.listObjects(params).promise();
                for(const elem of data.Contents){
                    if(elem.Key.indexOf("bulkfiles") <= 0){
                        continue;
                    }
                    var k = decodeURIComponent(elem.Key.replace(/\+/g, ' '));
                    k = k.replace(/\\/g, "/");
                    if(k.endsWith("/")){
                        continue;
                    }
                    const keys = k.split("/");
                    if(keys.indexOf('encrypted') > -1){
                        continue;
                    }
                    if(6 == keys.length){
                         //This could be a bulkfile
                         if(keys[3] != "bulkfiles"){
                            continue;
                        }
                        if(['csv','ach','fedwire','rtp'].indexOf(keys[4]) == -1){
                            continue;
                        }
                        var last_modified = elem.LastModified.valueOf();
                        var current_time_milli = Date.now();
                        var age = (current_time_milli - last_modified);
                        if(age < MIN30_MILLI){
                            console.log(`Retry:${k} `);
                            continue;
                        }
                        files.push({
                            tenantId:keys[0],
                            file_type:keys[4],
                            is_bulkfile:true,
                            is_inbound_ach:false,
                            is_outbound_ach:false,
                            bucket:LISTENED_BUCKET,
                            file_name:k,
                            encrypted_file:`encrypted/${k}`,
                            desc:'File is not picked up for processing for morethan 30 minutes'
                        });
                    }
                }
                if (!data.IsTruncated) {
                    break;
                }
                params.Marker = data.NextMarker;
            }
        }
        return files;
    }
    fetchUnProcessedInboundFiles = async (awsManager,folder) => {
        //INBOUND ACH
        console.log(`Checking unprocessed inbound ach files in ${LISTENED_BUCKET}/${folder}`);
        var params = {
            Bucket : LISTENED_BUCKET,
            Prefix: folder
        };
        const files = [];
        for (;;) {
            //var data = await S3.listObjects(params).promise();
            var data = await awsManager.s3.listObjects(params).promise();
            for(const elem of data.Contents){
                var k = decodeURIComponent(elem.Key.replace(/\+/g, ' '));
                k = k.replace(/\\/g, "/");
                if(k.endsWith("/")){
                    continue;
                }
                const keys = k.split("/");
                if(['INBOUND'].indexOf(keys[2]) == -1){
                    continue;
                }
                try{
                    const routing_number = keys[3];
                    if(routing_number == null || routing_number.trim().length == 0){
                        continue;
                    }
                    console.log(`Finding tenant name for inbound file with routing number:${routing_number}`);
                    const tenant = await this.tenantLookupByRTN(routing_number,awsManager);
                    if(tenant){
                        var last_modified = elem.LastModified.valueOf();
                        var current_time_milli = Date.now();
                        var age = (current_time_milli - last_modified);
                        if(age < MIN30_MILLI){
                            console.log(`Retry Inbound:${k} `);
                            continue;
                        }
                        files.push({
                            tenantId:tenant,
                            routing_number:routing_number,
                            is_bulkfile:false,
                            is_inbound_ach:true,
                            is_outbound_ach:false,
                            bucket:LISTENED_BUCKET,
                            file_name:k,
                            encrypted_file:`${keys[0]}/encrypted/${keys[1]}/${keys[2]}/${keys[3]}/${keys[4]}`,
                            desc:'File is not picked up for processing for morethan 30 minutes'
                        });
                    }else{
                        files.push({
                            tenantId:'finzly',
                            routing_number:routing_number,
                            is_bulkfile:false,
                            is_inbound_ach:true,
                            is_outbound_ach:false,
                            bucket:LISTENED_BUCKET,
                            file_name:k,
                            encrypted_file:`${keys[0]}/encrypted/${keys[1]}/${keys[2]}/${keys[3]}/${keys[4]}`,
                            desc:`Routing number:${routing_number} is NOT mapped to any tenant`
                        });
                        console.log(`Routing number:${routing_number} is not mapped to any tenant`);
                        continue;
                    }

                }catch(e){
                    console.log('Failed to find tenant associated with the routing number',e);
                    continue;
                }
            }
            if (!data.IsTruncated) {
                break;
            }
            params.Marker = data.NextMarker;
        }
        return files;
    }
    fetchUnProcessedOutboundFiles = async (awsManager) => {
        //OUTBOUND ACH
        var params = {
            Bucket : LISTENED_BUCKET,
            Prefix: OUTBOUND_ACH_FOLDER
        };
        const files = [];
        for (;;) {
            //var data = await S3.listObjects(params).promise();
            var data = await awsManager.s3.listObjects(params).promise();
            for(const elem of data.Contents){
                var k = decodeURIComponent(elem.Key.replace(/\+/g, ' '));
                k = k.replace(/\\/g, "/");
                if(k.endsWith("/")){
                    continue;
                }
                const keys = k.split("/");
                if(['OUTBOUND'].indexOf(keys[2]) == -1){
                    continue;
                }
                try{
                    const tenantId = keys[3];
                    var last_modified = elem.LastModified.valueOf();
                    var current_time_milli = Date.now();
                    var age = (current_time_milli - last_modified);
                    if(age < MIN30_MILLI){
                        console.log(`Retry Inbound:${k} `);
                        continue;
                    }
                    files.push({
                        tenantId:tenantId,
                        is_outbound_ach:true,
                        is_bulkfile:false,
                        is_inbound_ach:false,
                        bucket:LISTENED_BUCKET,
                        file_name:k,
                        encrypted_file:`${keys[0]}/encrypted/${keys[1]}/${keys[2]}/${keys[3]}/${keys[4]}`,
                        desc:'File is not picked up for processing for morethan 30 minutes'
                    });
                }catch(e){
                    console.log('Failed to find tenant associated with the routing number',e);
                    continue;
                }
            }
            if (!data.IsTruncated) {
                break;
            }
            params.Marker = data.NextMarker;
        }
        return files;
    }
    notifyMonitoringService = async (files,SQS) => {
        for (const file of files) {
            let file_type = "Unknown file"
            let event_type = 'Unknown'
            if(file.is_bulkfile){
                event_type = 'BULKFILE_PROCESS_PENDING'
                file_type = "Bulk file"
            }else if(file.is_inbound_ach){
                event_type = 'ACH_INBOUND_PROCESS_PENDING'
                file_type = "ACH Inbound file"
            }else if(file.is_outbound_ach){
                event_type = 'ACH_OUTBOUND_PROCESS_PENDING'
                file_type = "ACH Outbound file"
            }
            const event_id = await helper.createEventId(file.tenantId,file.file_name);
            let obj = {
                //event_id:file.file_name,
                event_id:event_id,
                event_type: event_type,
                source_system: `${file_type}`,
                tenant_name: file.tenantId,
                details: JSON.stringify({"Tenant":file.tenantId,"FileName":`${file.file_name}`}),
                description: file.desc
            };
            const queueUrl = await this.getQueueUrl(MONITORING_SQS_NAME,SQS);
            if (queueUrl) {
                const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                this.log.info("ACM notification send successfully :: ", obj)
            }
        }
    }
    getQueueUrl = async (queue_name,SQS) => {
        try{
            const data = await SQS.getQueueUrl({QueueName: queue_name}).promise();
            return data.QueueUrl;
        }catch(err){
            console.log(err)
        }
        return null;
    }
    async process(event, context, callback) {
        const awsManager = new awsmanager();
        try {
            //1. Check BuckFile folder
            //2. Check Inbound folder
            //3. Check Outbound folder
           let SQS = new AWS.SQS({region:REGION});
            
            var files = await this.fetchUnProcessedBulkFiles(awsManager);
            if(files && files.length > 0){
                await this.notifyMonitoringService(files,SQS);
            }else{
                console.log(`No unprocessed bulk files`)
            }
            //Check the unprocessed INBOUND files
            files = await this.fetchUnProcessedInboundFiles(awsManager,INBOUND_ACH_FOLDER);
            if(files && files.length > 0){
                await this.notifyMonitoringService(files,SQS);
            }else{
                console.log(`No unprocessed inbound ach files`)
            }
            //Check the unprocessed INBOUND encrypted files
            files = await this.fetchUnProcessedInboundFiles(awsManager,ENCRYPTED_INBOUND_ACH_FOLDER);
            if(files && files.length > 0){
                await this.notifyMonitoringService(files,SQS);
            }else{
                console.log(`No unprocessed encrypted inbound ach files`)
            }
           //Check the unprocessed OUTBOUND files
            files = await this.fetchUnProcessedOutboundFiles(awsManager);
            if(files && files.length > 0){
                await this.notifyMonitoringService(files,SQS);
            }else{
                console.log(`No unprocessed outbound files`)
            }
            //Failed to transmit ACH Files
            await this.findFailedToTransmitACHFiles(awsManager,SQS);

            await helper.register_heartbeat(
                `${MONITORING_SERVICE_URL}/heartbeat`,
                API_KEY,
                awsManager,
                'BULKFILE_PROCESS_PENDING',
                `BankOS`,
                'Unprocessed Bulk files'
            );
            await helper.register_heartbeat(
                `${MONITORING_SERVICE_URL}/heartbeat`,
                API_KEY,
                awsManager,
                'ACH_INBOUND_PROCESS_PENDING',
                `BankOS`,
                'Unprocessed ACH Inbound files'
            );
            await helper.register_heartbeat(
                `${MONITORING_SERVICE_URL}/heartbeat`,
                API_KEY,
                awsManager,
                'ACH_OUTBOUND_PROCESS_PENDING',
                `BankOS`,
                'Unprocessed ACH Outbound files'
            );
        } catch(err) {
            this.log.error(`SFTP Backup Error: `, err);
            await helper.notify_failure(awsManager,"pending-ach-check",err.message);
            return responseHelper.sendServerErrorResponse({
                message: err.message
            })
        }
    }
}

exports.scheduler = async(event, context, callback) => {
    return await new NotifyPendingOutboundACHFiles().handler(event, context, callback);
};