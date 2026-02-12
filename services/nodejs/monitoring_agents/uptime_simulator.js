const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const mysql = require("mysql2");
const AWS = require("aws-sdk");
const helper = require('./helper.js');
const responseHelper = require('/opt/modules/common/response');
const { STAGE,REGION} = process.env;

class UptimeSimulatorJob extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        const awsManager = new awsmanager();
        var monitoring_db_conn = null;
        var error_desc = "";
        const platforms = [
            { "status": 1, "description": "App is healthy", "resource": "ACH" },
            { "status": 0, "description": "App is partially healthy", "resource": "FEDWIRE" },
            { "status": -1, "description": "System is not accessible", "resource": "CRM1" },
            { "status": 0, "description": "System is partially healthy", "resource": "CRM2" },
            { "status": -1, "description": "System is not accessible", "resource": "ACH" }
        ];
        const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format timestamp
        try{
            let message = "Process completed."
            monitoring_db_conn = await helper.create_connection_with_monitoring_db(STAGE, awsManager);
            if (!monitoring_db_conn) {
                error_desc = 'Unable to connect to monitoring  database';
                this.log.error(error_desc);
                throw new Error(`Process failed: ${error_desc}`);
            }
            const promises = platforms.map((health) => {
                const sql = `
                    INSERT INTO galaxy_monitoring.heartbeat (platform, resource, status, description, heartbeat, grp)
                    VALUES (?, ?, ?, ?, ?, ?)`;
                
                return new Promise((resolve, reject) => {
                    monitoring_db_conn.query(sql, [
                        "bankos", 
                        health.resource, 
                        health.status, 
                        health.description, 
                        createdAt,
                        "PaymentGalaxy"
                    ], (error, results) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(results);
                        }
                    });
                });
            });
            await Promise.all(promises);
            return {
                statusCode: 200,
                body: JSON.stringify('Heartbeat records created successfully!')
            };
        } catch (err) {
            this.log.error(`Internal Server Error: `, err);
            await helper.notify_failure(awsManager,"uptime_report_job",err.message);
            return responseHelper.sendServerErrorResponse({
                message: err.message
            })
        }finally{
            if(monitoring_db_conn != null){
                monitoring_db_conn.end();
            }
        }
    }
}
exports.scheduler = async (event, context, callback) => {
    return await new UptimeSimulatorJob().handler(event, context, callback);
};