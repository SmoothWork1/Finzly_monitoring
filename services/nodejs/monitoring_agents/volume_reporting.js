const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const AWS = require("aws-sdk");
const helper = require('./helper.js');
const responseHelper = require('/opt/modules/common/response');
const { STAGE,MONITORING_SQS_NAME,TIME_LAPSE,STUCK_ACH_PAYMENT_STATUS_LIST,STUCK_FEDWIRE_PAYMENT_STATUS_LIST,STUCK_ACH_TRANSACTION_STATUS_LIST,STUCK_FEDWIRE_TRANSACTION_STATUS_LIST,REGION} = process.env;
const CHANNEL_ACH = "";
const CHANNEL_FEDWIRE = "";
const SQLHelper = require('/opt/modules/common/mysql_helper');
const ENUM = require('./enum.js')
const MONITORING_SERVICE_URL = process.env.MONITORING_SERVICE_URL;
const API_KEY = process.env.API_KEY;
class VolumeReporting extends BaseHandler {
    constructor() {
        super();
    }
    async generateUniqueId() {
        const timestamp = Date.now().toString(36); // Base-36 timestamp (shorter than decimal)
        const randomStr = Math.random().toString(36).substring(2, 8); // 6 random chars
        return `${timestamp}-${randomStr}`;
    }
    async payment_summary(tenant_name, monit_conn,tenant_db_conn) {
        //const payment_report_select = `select payment_type,channel,wire_type as type,customer_type as customer_type,count(*) as volume,sum(sender_amount) as value,payment_date as payment_date,payment_status from paymentgalaxy_${tenant_name}.payment where channel in ('ACH','API','BRANCH','FEDWIRE','FTP','Payments','RTP','FEDNOW','TELLER','CASHOS') and payment_type in ('BOOK_TRANSFER','SAME_DAY_ACH','REGULAR_ACH','WIRE','REALTIME_RTP','REALTIME_FEDNOW','SPOT_SWIFT') and wire_type in ('BOOK_TRANSFER','INCOMING_PAYMENT','DEBIT_REQUEST','OUTGOING_PAYMENT','FI_WIRE_OUT','FI_WIRE_IN') and payment_date = CURDATE() - INTERVAL 1 DAY group by channel, payment_type`;
        //const payment_report_noc_select = `select payment.payment_type as payment_type,payment.channel as channel,payment.wire_type as type,payment.customer_type as customer_type,count(payment.payment_id) as volume,sum(sender_amount) as value, payment.payment_date, ach_noc.status as noc_status from paymentgalaxy_${tenant_name}.payment as payment, galaxy_ach_${tenant_name}.ach_noc_record as ach_noc where payment.channel in ('ACH','API','BRANCH','FEDWIRE','FTP','Payments','RTP','FEDNOW','TELLER','CASHOS') and payment.payment_type in ('BOOK_TRANSFER','SAME_DAY_ACH','REGULAR_ACH','WIRE','REALTIME_RTP','REALTIME_FEDNOW','SPOT_SWIFT') and payment.wire_type in ('BOOK_TRANSFER','INCOMING_PAYMENT','DEBIT_REQUEST','OUTGOING_PAYMENT','FI_WIRE_OUT','FI_WIRE_IN') and payment.payment_date = CURDATE() - INTERVAL 1 DAY and payment.payment_id=ach_noc.payment_id  group by payment.channel, payment.payment_type`;
        //const payment_report_return_select = `select payment.payment_type as payment_type,payment.channel as channel,payment.wire_type as type,payment.customer_type as customer_type,count(payment.payment_id) as volume,sum(sender_amount) as value,payment.payment_date, ach_return.status as return_status from paymentgalaxy_${tenant_name}.payment as payment, galaxy_ach_${tenant_name}.ach_return_record as ach_return where payment.channel in ('ACH','API','BRANCH','FEDWIRE','FTP','Payments','RTP','FEDNOW','CASHOS') and payment.payment_type in ('BOOK_TRANSFER','SAME_DAY_ACH','REGULAR_ACH','WIRE','REALTIME_RTP','REALTIME_FEDNOW','SPOT_SWIFT') and payment.wire_type in ('BOOK_TRANSFER','INCOMING_PAYMENT','DEBIT_REQUEST','OUTGOING_PAYMENT','FI_WIRE_OUT','FI_WIRE_IN') and payment.payment_date = CURDATE() - INTERVAL 1 DAY and payment.payment_id=ach_return.payment_id  group by payment.channel, payment.payment_type`;
        //const payment_report_reversal_select = `select payment.payment_type as payment_type,payment.channel as channel,payment.wire_type as type,payment.customer_type as customer_type,count(payment.payment_id) as volume,sum(sender_amount) as value, ach_reversal.status as reversal_status from paymentgalaxy_${tenant_name}.payment as payment, galaxy_ach_${tenant_name}.ach_reversal_record as ach_reversal where payment.channel in ('ACH','API','BRANCH','FEDWIRE','FTP','Payments','RTP','FEDNOW','CASHOS') and payment.payment_type in ('BOOK_TRANSFER','SAME_DAY_ACH','REGULAR_ACH','WIRE','REALTIME_RTP','REALTIME_FEDNOW','SPOT_SWIFT') and payment.wire_type in ('BOOK_TRANSFER','INCOMING_PAYMENT','DEBIT_REQUEST','OUTGOING_PAYMENT','FI_WIRE_OUT','FI_WIRE_IN') and payment.payment_date = CURDATE() - INTERVAL 1 DAY and payment.payment_id=ach_reversal.payment_id  group by payment.channel, payment.payment_type`;
        try{
            const query = `
            SELECT 
                payment_type,
                channel,
                wire_type AS wire_type,
                customer_type AS customer_type,
                COUNT(*) AS volume,
                SUM(sender_amount) AS value,
                payment_date AS payment_date,
                payment_status AS status
            FROM 
                paymentgalaxy_${tenant_name}.payment
            WHERE 
                channel IN ('ACH', 'API', 'BRANCH', 'FEDWIRE', 'FTP', 'Payments', 'RTP', 'FEDNOW', 'TELLER', 'CASHOS')
                AND payment_type IN ('BOOK_TRANSFER', 'SAME_DAY_ACH', 'REGULAR_ACH', 'WIRE', 'REALTIME_RTP', 'REALTIME_FEDNOW', 'SPOT_SWIFT')
                AND wire_type IN ('BOOK_TRANSFER', 'INCOMING_PAYMENT', 'DEBIT_REQUEST', 'OUTGOING_PAYMENT', 'FI_WIRE_OUT', 'FI_WIRE_IN')
                AND payment_date = CURDATE() - INTERVAL 1 DAY
            GROUP BY 
                channel,
                payment_type,
                wire_type,
                customer_type,
                payment_date, 
                payment_status
        `;

        console.log(query);
        // Execute the select query
        //const [rows] = await tenant_db_conn.execute(query);
        const rows = await helper.query(query,tenant_db_conn);
        //console.log(rows);
        if (rows == null || rows == 'undefined' || rows.length === 0) {
            return;
        }
        const insertQuery = `
            INSERT INTO galaxy_monitoring.payment_summary (
                summary_id,tenant_name,report_type,payment_type, channel, wire_type, customer_type, volume, value, payment_date, status
            ) VALUES ?
        `;
        
        // Format rows into an array of values for bulk insert
        const values = [];
        for(const row of rows){
            const uid = await this.generateUniqueId();
            values.push([
                uid,
                tenant_name,
                'payment_report',
                row.payment_type,
                row.channel,
                row.wire_type,
                row.customer_type,
                row.volume,
                row.value,
                row.payment_date,
                row.status
            ])
        }
        await helper.insert(insertQuery, [values],monit_conn);
        return true;
        }catch(ex){
            console.log(ex);
        }
    }
    async payment_summary_noc(tenant_name, monit_conn,tenant_db_conn) {
        //const payment_report_select = `select payment_type,channel,wire_type as type,customer_type as customer_type,count(*) as volume,sum(sender_amount) as value,payment_date as payment_date,payment_status from paymentgalaxy_${tenant_name}.payment where channel in ('ACH','API','BRANCH','FEDWIRE','FTP','Payments','RTP','FEDNOW','TELLER','CASHOS') and payment_type in ('BOOK_TRANSFER','SAME_DAY_ACH','REGULAR_ACH','WIRE','REALTIME_RTP','REALTIME_FEDNOW','SPOT_SWIFT') and wire_type in ('BOOK_TRANSFER','INCOMING_PAYMENT','DEBIT_REQUEST','OUTGOING_PAYMENT','FI_WIRE_OUT','FI_WIRE_IN') and payment_date = CURDATE() - INTERVAL 1 DAY group by channel, payment_type`;
        //const payment_report_noc_select = `select payment.payment_type as payment_type,payment.channel as channel,payment.wire_type as type,payment.customer_type as customer_type,count(payment.payment_id) as volume,sum(sender_amount) as value, payment.payment_date, ach_noc.status as noc_status from paymentgalaxy_${tenant_name}.payment as payment, galaxy_ach_${tenant_name}.ach_noc_record as ach_noc where payment.channel in ('ACH','API','BRANCH','FEDWIRE','FTP','Payments','RTP','FEDNOW','TELLER','CASHOS') and payment.payment_type in ('BOOK_TRANSFER','SAME_DAY_ACH','REGULAR_ACH','WIRE','REALTIME_RTP','REALTIME_FEDNOW','SPOT_SWIFT') and payment.wire_type in ('BOOK_TRANSFER','INCOMING_PAYMENT','DEBIT_REQUEST','OUTGOING_PAYMENT','FI_WIRE_OUT','FI_WIRE_IN') and payment.payment_date = CURDATE() - INTERVAL 1 DAY and payment.payment_id=ach_noc.payment_id  group by payment.channel, payment.payment_type`;
        //const payment_report_return_select = `select payment.payment_type as payment_type,payment.channel as channel,payment.wire_type as type,payment.customer_type as customer_type,count(payment.payment_id) as volume,sum(sender_amount) as value,payment.payment_date, ach_return.status as return_status from paymentgalaxy_${tenant_name}.payment as payment, galaxy_ach_${tenant_name}.ach_return_record as ach_return where payment.channel in ('ACH','API','BRANCH','FEDWIRE','FTP','Payments','RTP','FEDNOW','CASHOS') and payment.payment_type in ('BOOK_TRANSFER','SAME_DAY_ACH','REGULAR_ACH','WIRE','REALTIME_RTP','REALTIME_FEDNOW','SPOT_SWIFT') and payment.wire_type in ('BOOK_TRANSFER','INCOMING_PAYMENT','DEBIT_REQUEST','OUTGOING_PAYMENT','FI_WIRE_OUT','FI_WIRE_IN') and payment.payment_date = CURDATE() - INTERVAL 1 DAY and payment.payment_id=ach_return.payment_id  group by payment.channel, payment.payment_type`;
        //const payment_report_reversal_select = `select payment.payment_type as payment_type,payment.channel as channel,payment.wire_type as type,payment.customer_type as customer_type,count(payment.payment_id) as volume,sum(sender_amount) as value, ach_reversal.status as reversal_status from paymentgalaxy_${tenant_name}.payment as payment, galaxy_ach_${tenant_name}.ach_reversal_record as ach_reversal where payment.channel in ('ACH','API','BRANCH','FEDWIRE','FTP','Payments','RTP','FEDNOW','CASHOS') and payment.payment_type in ('BOOK_TRANSFER','SAME_DAY_ACH','REGULAR_ACH','WIRE','REALTIME_RTP','REALTIME_FEDNOW','SPOT_SWIFT') and payment.wire_type in ('BOOK_TRANSFER','INCOMING_PAYMENT','DEBIT_REQUEST','OUTGOING_PAYMENT','FI_WIRE_OUT','FI_WIRE_IN') and payment.payment_date = CURDATE() - INTERVAL 1 DAY and payment.payment_id=ach_reversal.payment_id  group by payment.channel, payment.payment_type`;
        try{
            const query = `
                SELECT 
                    payment.payment_type AS payment_type,
                    payment.channel AS channel,
                    payment.wire_type AS wire_type,
                    payment.customer_type AS customer_type,
                    COUNT(payment.payment_id) AS volume,
                    SUM(payment.sender_amount) AS value,
                    payment.payment_date,
                    ach_noc.status AS status
                FROM 
                    paymentgalaxy_${tenant_name}.payment AS payment
                INNER JOIN 
                    galaxy_ach_${tenant_name}.ach_noc_record AS ach_noc
                ON 
                    payment.payment_id = ach_noc.payment_id
                WHERE 
                    payment.channel IN ('ACH', 'API', 'BRANCH', 'FEDWIRE', 'FTP', 'Payments', 'RTP', 'FEDNOW', 'TELLER', 'CASHOS')
                    AND payment.payment_type IN ('BOOK_TRANSFER', 'SAME_DAY_ACH', 'REGULAR_ACH', 'WIRE', 'REALTIME_RTP', 'REALTIME_FEDNOW', 'SPOT_SWIFT')
                    AND payment.wire_type IN ('BOOK_TRANSFER', 'INCOMING_PAYMENT', 'DEBIT_REQUEST', 'OUTGOING_PAYMENT', 'FI_WIRE_OUT', 'FI_WIRE_IN')
                    AND payment.payment_date = CURDATE() - INTERVAL 1 DAY
                GROUP BY 
                    payment.channel,
                    payment.payment_type,
                    payment.wire_type,
                    payment.customer_type,
                    payment.payment_date,
                    ach_noc.status;
        `;

        console.log(query);
        // Execute the select query
        //const [rows] = await tenant_db_conn.execute(query);
        const rows = await helper.query(query,tenant_db_conn);
        console.log(rows);
        if (rows == null || rows == 'undefined' || rows.length === 0) {
            return;
        }
        const insertQuery = `
            INSERT INTO galaxy_monitoring.payment_summary (
                summary_id,tenant_name,report_type,payment_type, channel, wire_type, customer_type, volume, value, payment_date, status
            ) VALUES ?
        `;
        
        // Format rows into an array of values for bulk insert
        const values = [];
        for(const row of rows){
            const uid = await this.generateUniqueId();
            values.push([
                uid,
                tenant_name,
                'noc_report',
                row.payment_type,
                row.channel,
                row.wire_type,
                row.customer_type,
                row.volume,
                row.value,
                row.payment_date,
                row.status
            ])
        }
        await helper.insert(insertQuery, [values],monit_conn);
        return true;
        }catch(ex){
            console.log(ex);
        }
    }
    async payment_summary_returns(tenant_name, monit_conn,tenant_db_conn) {
        //const payment_report_select = `select payment_type,channel,wire_type as type,customer_type as customer_type,count(*) as volume,sum(sender_amount) as value,payment_date as payment_date,payment_status from paymentgalaxy_${tenant_name}.payment where channel in ('ACH','API','BRANCH','FEDWIRE','FTP','Payments','RTP','FEDNOW','TELLER','CASHOS') and payment_type in ('BOOK_TRANSFER','SAME_DAY_ACH','REGULAR_ACH','WIRE','REALTIME_RTP','REALTIME_FEDNOW','SPOT_SWIFT') and wire_type in ('BOOK_TRANSFER','INCOMING_PAYMENT','DEBIT_REQUEST','OUTGOING_PAYMENT','FI_WIRE_OUT','FI_WIRE_IN') and payment_date = CURDATE() - INTERVAL 1 DAY group by channel, payment_type`;
        //const payment_report_noc_select = `select payment.payment_type as payment_type,payment.channel as channel,payment.wire_type as type,payment.customer_type as customer_type,count(payment.payment_id) as volume,sum(sender_amount) as value, payment.payment_date, ach_noc.status as noc_status from paymentgalaxy_${tenant_name}.payment as payment, galaxy_ach_${tenant_name}.ach_noc_record as ach_noc where payment.channel in ('ACH','API','BRANCH','FEDWIRE','FTP','Payments','RTP','FEDNOW','TELLER','CASHOS') and payment.payment_type in ('BOOK_TRANSFER','SAME_DAY_ACH','REGULAR_ACH','WIRE','REALTIME_RTP','REALTIME_FEDNOW','SPOT_SWIFT') and payment.wire_type in ('BOOK_TRANSFER','INCOMING_PAYMENT','DEBIT_REQUEST','OUTGOING_PAYMENT','FI_WIRE_OUT','FI_WIRE_IN') and payment.payment_date = CURDATE() - INTERVAL 1 DAY and payment.payment_id=ach_noc.payment_id  group by payment.channel, payment.payment_type`;
        //const payment_report_return_select = `select payment.payment_type as payment_type,payment.channel as channel,payment.wire_type as type,payment.customer_type as customer_type,count(payment.payment_id) as volume,sum(sender_amount) as value,payment.payment_date, ach_return.status as return_status from paymentgalaxy_${tenant_name}.payment as payment, galaxy_ach_${tenant_name}.ach_return_record as ach_return where payment.channel in ('ACH','API','BRANCH','FEDWIRE','FTP','Payments','RTP','FEDNOW','CASHOS') and payment.payment_type in ('BOOK_TRANSFER','SAME_DAY_ACH','REGULAR_ACH','WIRE','REALTIME_RTP','REALTIME_FEDNOW','SPOT_SWIFT') and payment.wire_type in ('BOOK_TRANSFER','INCOMING_PAYMENT','DEBIT_REQUEST','OUTGOING_PAYMENT','FI_WIRE_OUT','FI_WIRE_IN') and payment.payment_date = CURDATE() - INTERVAL 1 DAY and payment.payment_id=ach_return.payment_id  group by payment.channel, payment.payment_type`;
        //const payment_report_reversal_select = `select payment.payment_type as payment_type,payment.channel as channel,payment.wire_type as type,payment.customer_type as customer_type,count(payment.payment_id) as volume,sum(sender_amount) as value, ach_reversal.status as reversal_status from paymentgalaxy_${tenant_name}.payment as payment, galaxy_ach_${tenant_name}.ach_reversal_record as ach_reversal where payment.channel in ('ACH','API','BRANCH','FEDWIRE','FTP','Payments','RTP','FEDNOW','CASHOS') and payment.payment_type in ('BOOK_TRANSFER','SAME_DAY_ACH','REGULAR_ACH','WIRE','REALTIME_RTP','REALTIME_FEDNOW','SPOT_SWIFT') and payment.wire_type in ('BOOK_TRANSFER','INCOMING_PAYMENT','DEBIT_REQUEST','OUTGOING_PAYMENT','FI_WIRE_OUT','FI_WIRE_IN') and payment.payment_date = CURDATE() - INTERVAL 1 DAY and payment.payment_id=ach_reversal.payment_id  group by payment.channel, payment.payment_type`;
        try{
            const query = `
                SELECT 
                    payment.payment_type AS payment_type,
                    payment.channel AS channel,
                    payment.wire_type AS wire_type,
                    payment.customer_type AS customer_type,
                    COUNT(payment.payment_id) AS volume,
                    SUM(sender_amount) AS value,
                    payment.payment_date,
                    ach_return.status AS status
                FROM 
                    paymentgalaxy_${tenant_name}.payment AS payment
                INNER JOIN 
                    galaxy_ach_${tenant_name}.ach_return_record AS ach_return
                ON 
                    payment.payment_id = ach_return.payment_id
                WHERE 
                    payment.channel IN ('ACH', 'API', 'BRANCH', 'FEDWIRE', 'FTP', 'Payments', 'RTP', 'FEDNOW', 'CASHOS')
                    AND payment.payment_type IN ('BOOK_TRANSFER', 'SAME_DAY_ACH', 'REGULAR_ACH', 'WIRE', 'REALTIME_RTP', 'REALTIME_FEDNOW', 'SPOT_SWIFT')
                    AND payment.wire_type IN ('BOOK_TRANSFER', 'INCOMING_PAYMENT', 'DEBIT_REQUEST', 'OUTGOING_PAYMENT', 'FI_WIRE_OUT', 'FI_WIRE_IN')
                    AND payment.payment_date = CURDATE() - INTERVAL 1 DAY
                GROUP BY 
                    payment.channel,
                    payment.payment_type,
                    payment.wire_type,
                    payment.customer_type,
                    payment.payment_date,
                    ach_return.status;
        `;
        console.log(query);
        // Execute the select query
        //const [rows] = await tenant_db_conn.execute(query);
        const rows = await helper.query(query,tenant_db_conn);
        console.log(rows);
        if (rows == null || rows == 'undefined' || rows.length === 0) {
            return;
        }
        const insertQuery = `
            INSERT INTO galaxy_monitoring.payment_summary (
                summary_id,tenant_name,report_type,payment_type, channel, wire_type, customer_type, volume, value, payment_date, status
            ) VALUES ?
        `;
        
        // Format rows into an array of values for bulk insert
        const values = [];
        for(const row of rows){
            const uid = await this.generateUniqueId();
            values.push([
                uid,
                tenant_name,
                'returns_report',
                row.payment_type,
                row.channel,
                row.wire_type,
                row.customer_type,
                row.volume,
                row.value,
                row.payment_date,
                row.status
            ])
        }
        await helper.insert(insertQuery, [values],monit_conn);
        return true;
        }catch(ex){
            console.log(ex);
        }
    }
    async payment_summary_reversals(tenant_name, monit_conn,tenant_db_conn) {
        //const payment_report_select = `select payment_type,channel,wire_type as type,customer_type as customer_type,count(*) as volume,sum(sender_amount) as value,payment_date as payment_date,payment_status from paymentgalaxy_${tenant_name}.payment where channel in ('ACH','API','BRANCH','FEDWIRE','FTP','Payments','RTP','FEDNOW','TELLER','CASHOS') and payment_type in ('BOOK_TRANSFER','SAME_DAY_ACH','REGULAR_ACH','WIRE','REALTIME_RTP','REALTIME_FEDNOW','SPOT_SWIFT') and wire_type in ('BOOK_TRANSFER','INCOMING_PAYMENT','DEBIT_REQUEST','OUTGOING_PAYMENT','FI_WIRE_OUT','FI_WIRE_IN') and payment_date = CURDATE() - INTERVAL 1 DAY group by channel, payment_type`;
        //const payment_report_noc_select = `select payment.payment_type as payment_type,payment.channel as channel,payment.wire_type as type,payment.customer_type as customer_type,count(payment.payment_id) as volume,sum(sender_amount) as value, payment.payment_date, ach_noc.status as noc_status from paymentgalaxy_${tenant_name}.payment as payment, galaxy_ach_${tenant_name}.ach_noc_record as ach_noc where payment.channel in ('ACH','API','BRANCH','FEDWIRE','FTP','Payments','RTP','FEDNOW','TELLER','CASHOS') and payment.payment_type in ('BOOK_TRANSFER','SAME_DAY_ACH','REGULAR_ACH','WIRE','REALTIME_RTP','REALTIME_FEDNOW','SPOT_SWIFT') and payment.wire_type in ('BOOK_TRANSFER','INCOMING_PAYMENT','DEBIT_REQUEST','OUTGOING_PAYMENT','FI_WIRE_OUT','FI_WIRE_IN') and payment.payment_date = CURDATE() - INTERVAL 1 DAY and payment.payment_id=ach_noc.payment_id  group by payment.channel, payment.payment_type`;
        //const payment_report_return_select = `select payment.payment_type as payment_type,payment.channel as channel,payment.wire_type as type,payment.customer_type as customer_type,count(payment.payment_id) as volume,sum(sender_amount) as value,payment.payment_date, ach_return.status as return_status from paymentgalaxy_${tenant_name}.payment as payment, galaxy_ach_${tenant_name}.ach_return_record as ach_return where payment.channel in ('ACH','API','BRANCH','FEDWIRE','FTP','Payments','RTP','FEDNOW','CASHOS') and payment.payment_type in ('BOOK_TRANSFER','SAME_DAY_ACH','REGULAR_ACH','WIRE','REALTIME_RTP','REALTIME_FEDNOW','SPOT_SWIFT') and payment.wire_type in ('BOOK_TRANSFER','INCOMING_PAYMENT','DEBIT_REQUEST','OUTGOING_PAYMENT','FI_WIRE_OUT','FI_WIRE_IN') and payment.payment_date = CURDATE() - INTERVAL 1 DAY and payment.payment_id=ach_return.payment_id  group by payment.channel, payment.payment_type`;
        //const payment_report_reversal_select = `select payment.payment_type as payment_type,payment.channel as channel,payment.wire_type as type,payment.customer_type as customer_type,count(payment.payment_id) as volume,sum(sender_amount) as value, ach_reversal.status as reversal_status from paymentgalaxy_${tenant_name}.payment as payment, galaxy_ach_${tenant_name}.ach_reversal_record as ach_reversal where payment.channel in ('ACH','API','BRANCH','FEDWIRE','FTP','Payments','RTP','FEDNOW','CASHOS') and payment.payment_type in ('BOOK_TRANSFER','SAME_DAY_ACH','REGULAR_ACH','WIRE','REALTIME_RTP','REALTIME_FEDNOW','SPOT_SWIFT') and payment.wire_type in ('BOOK_TRANSFER','INCOMING_PAYMENT','DEBIT_REQUEST','OUTGOING_PAYMENT','FI_WIRE_OUT','FI_WIRE_IN') and payment.payment_date = CURDATE() - INTERVAL 1 DAY and payment.payment_id=ach_reversal.payment_id  group by payment.channel, payment.payment_type`;
        try{
            const query = `
                SELECT 
                    payment.payment_type AS payment_type,
                    payment.channel AS channel,
                    payment.wire_type AS wire_type,
                    payment.customer_type AS customer_type,
                    COUNT(payment.payment_id) AS volume,
                    SUM(sender_amount) AS value,
                    ach_reversal.status AS status
                FROM 
                    paymentgalaxy_${tenant_name}.payment AS payment
                INNER JOIN 
                    galaxy_ach_${tenant_name}.ach_reversal_record AS ach_reversal
                ON 
                    payment.payment_id = ach_reversal.payment_id
                WHERE 
                    payment.channel IN ('ACH', 'API', 'BRANCH', 'FEDWIRE', 'FTP', 'Payments', 'RTP', 'FEDNOW', 'CASHOS')
                    AND payment.payment_type IN ('BOOK_TRANSFER', 'SAME_DAY_ACH', 'REGULAR_ACH', 'WIRE', 'REALTIME_RTP', 'REALTIME_FEDNOW', 'SPOT_SWIFT')
                    AND payment.wire_type IN ('BOOK_TRANSFER', 'INCOMING_PAYMENT', 'DEBIT_REQUEST', 'OUTGOING_PAYMENT', 'FI_WIRE_OUT', 'FI_WIRE_IN')
                    AND payment.payment_date = CURDATE() - INTERVAL 1 DAY
                GROUP BY 
                    payment.channel,
                    payment.payment_type,
                    payment.wire_type,
                    payment.customer_type,
                    ach_reversal.status;
        `;
        console.log(query);
        // Execute the select query
        //const [rows] = await tenant_db_conn.execute(query);
        const rows = await helper.query(query,tenant_db_conn);
        console.log(rows);
        if (rows == null || rows == 'undefined' || rows.length === 0) {
            return;
        }
        const insertQuery = `
            INSERT INTO galaxy_monitoring.payment_summary (
                summary_id,tenant_name,report_type,payment_type, channel, wire_type, customer_type, volume, value, payment_date, status
            ) VALUES ?
        `;
        
        // Format rows into an array of values for bulk insert
        const values = [];
        for(const row of rows){
            const uid = await this.generateUniqueId();
            values.push([
                uid,
                tenant_name,
                'reversals_report',
                row.payment_type,
                row.channel,
                row.wire_type,
                row.customer_type,
                row.volume,
                row.value,
                row.payment_date,
                row.status
            ])
        }
        await helper.insert(insertQuery, [values],monit_conn);
        return true;
        }catch(ex){
            console.log(ex);
        }
    }
    async process(event, context, callback) {
        const awsManager = new awsmanager();
        var monitoring_db_conn = null;
        try{
            this.log.info(event);
            let error_desc = null;
            let message = "Process completed."
            let SQS = new AWS.SQS({region:REGION});
            monitoring_db_conn = await helper.create_connection_with_monitoring_db(STAGE, awsManager);
            if (!monitoring_db_conn) {
                error_desc = 'Unable to connect to monitoring  database';
                this.log.error(error_desc);
                throw new Error(`Process failed: ${error_desc}`);

            }
            const all_tenants = await helper.fetchActiveTenants(STAGE,awsManager);
            for(const obj of all_tenants){
                const stg = obj.stage;
                for(const tenant_name of obj.tenants) {
                    var connection = null;
                    if(['oceanfirstbank','snb','finzly','testbank'].includes(tenant_name)){
                        continue;
                    }
                    try{
                        //Check payments of ACH channel
                        connection = await helper.create_connection_with_tenant_db(stg, tenant_name, awsManager);
                        if (!connection) {
                            error_desc = `Not able to read the ${tenant_name} database server properties from parameter store`;
                            throw new Error(`Process failed: ${error_desc}`);
                        }
                        await this.payment_summary(tenant_name,monitoring_db_conn,connection);
                        await this.payment_summary_noc(tenant_name,monitoring_db_conn,connection);
                        await this.payment_summary_returns(tenant_name,monitoring_db_conn,connection);
                        await this.payment_summary_reversals(tenant_name,monitoring_db_conn,connection);

                        
                        //console.log(results);
                    }catch(ex){
                        this.log.error(`Failed execute queries for tenant: ${tenant_name}: `, ex);
                        await helper.notify_failure(awsManager,"stuck-payments",ex.message);
                    }finally{
                        if (connection != null) {
                            connection.end();
                        }
                    }
                }
            }
            // await helper.register_heartbeat(
            //     `${MONITORING_SERVICE_URL}/heartbeat`,
            //     API_KEY,
            //     awsManager,
            //     'STUCK_PAYMENTS',
            //     'BankOS',
            //     `Stuck Payments - ACH, FEDWIRE, RTP etc`
            // );
        } catch (err) {
            this.log.error(`Internal Server Error: `, err);
            await helper.notify_failure(awsManager,"stuck-payments",err.message);
            return responseHelper.sendServerErrorResponse({
                message: err.message
            })
        }finally{
            if (monitoring_db_conn && monitoring_db_conn.end) {
                monitoring_db_conn.end();
            }
        }
    }
}
exports.scheduler = async (event, context, callback) => {
    return await new VolumeReporting().handler(event, context, callback);
};