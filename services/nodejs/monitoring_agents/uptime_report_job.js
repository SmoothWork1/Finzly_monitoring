const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const mysql = require("mysql2");
const AWS = require("aws-sdk");
const helper = require('./helper.js');
const responseHelper = require('/opt/modules/common/response');
const { STAGE,REGION} = process.env;

class UptimeReportJob extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        const awsManager = new awsmanager();
        var monitoring_db_conn = null;
        var error_desc = "";
        try{
            let message = "Process completed."
            monitoring_db_conn = await helper.create_connection_with_monitoring_db(STAGE, awsManager);
            if (!monitoring_db_conn) {
                error_desc = 'Unable to connect to monitoring  database';
                this.log.error(error_desc);
                throw new Error(`Process failed: ${error_desc}`);
            }
            const sql = `
            INSERT INTO galaxy_monitoring.consolidated_heartbeat (platform, resource, status, description, heartbeat, grp)
            SELECT 
                platform,
                resource,  -- Get resource directly from the heartbeat table
                CASE 
                    WHEN SUM(status = -1) > 0 THEN -1
                    WHEN SUM(status = 0) > 0 THEN 0
                    ELSE 1 
                END AS status,
                CASE 
                    WHEN SUM(status = -1) > 0 THEN 'System is not accessible'
                    WHEN SUM(status = 0) > 0 THEN 'App is partially healthy'
                    ELSE 'App is healthy'
                END AS description,
                NOW() AS heartbeat,
                grp  -- Group by this field, assuming it's available in the heartbeat records
            FROM 
                galaxy_monitoring.heartbeat
            GROUP BY 
                grp, platform, resource  -- Use group by grp to aggregate results by group
            `;
            await new Promise((resolve, reject) => {
                monitoring_db_conn.query(sql, (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });

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
    return await new UptimeReportJob().handler(event, context, callback);
};