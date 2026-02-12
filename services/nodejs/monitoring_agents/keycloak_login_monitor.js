const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const AWS = require("aws-sdk");
const helper = require('./helper.js');
const responseHelper = require('/opt/modules/common/response');
const { STAGE,MONITORING_SQS_NAME,REGION} = process.env;
const MONITORING_SERVICE_URL = process.env.MONITORING_SERVICE_URL;
const API_KEY = process.env.API_KEY;
const axios = require('axios');
const { DynamoDBClient, PutItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const IsolationForest = require('ml-isolation-forest');

// Environment variables (set in Lambda configuration)
const KEYCLOAK_URL = 'https://security-uat.finzly.io/auth';//process.env.KEYCLOAK_URL;
const REALM = 'BANKOS-UAT-RPB-BANK';//process.env.REALM;
const ADMIN_USER = 'keycloakadmin';//process.env.ADMIN_USER;
const ADMIN_PASS = 'keycloakpass';//process.env.ADMIN_PASS;
const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE || 'KeycloakEvents';
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;
const IsolationForest = require('ml-isolation-forest');
const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });
const snsClient = new SNSClient({ region: 'us-east-1' });

class KeycloakLoginMonitor extends BaseHandler {
    constructor() {
        super();
    }
    // Get Keycloak admin token
     getAdminToken = async () => {
        const response = await axios.post(
            `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
            new URLSearchParams({ grant_type: 'password', client_id: 'admin-cli', username: ADMIN_USER, password: ADMIN_PASS }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        return response.data.access_token;
    }
    // Fetch Keycloak events
    fetchLoginEvents = async (events) => {
        const minutesBack = 5; // Last 5 minutes (adjust based on schedule)
        const response = await axios.get(`${KEYCLOAK_URL}/admin/realms/${REALM}/events`, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                type: ['LOGIN', 'LOGIN_ERROR'],
                dateFrom: new Date(Date.now() - minutesBack * 60 * 1000).toISOString(),
                max: 1000
            }
        });
        return response.data.map(event => ({
            timestamp: event.time,
            type: event.type,
            ipAddress: event.details?.ipAddress || 'unknown',
            userId: event.userId || 'unknown',
            error: event.error || null
        }));
    }

    // Store events in DynamoDB
    storeEvents = async (events) => {
        for (const event of events) {
            const params = {
                TableName: DYNAMODB_TABLE,
                Item: {
                    IPAddress: { S: event.ipAddress },
                    Timestamp: { N: event.timestamp.toString() },
                    EventType: { S: event.type },
                    UserId: { S: event.userId },
                    Error: { S: event.error || 'none' },
                    HourOfDay: { N: new Date(event.timestamp).getUTCHours().toString() }
                }
            };
            await dynamoClient.send(new PutItemCommand(params));
        }
        console.log(`Stored ${events.length} events in DynamoDB`);
    }
    // Fetch historical data from DynamoDB for analysis
    fetchHistoricalData = async (minutesBack = 60) => {
        const params = {
            TableName: DYNAMODB_TABLE,
            KeyConditionExpression: 'IPAddress = :ip AND #ts >= :ts',
            ExpressionAttributeNames: { '#ts': 'Timestamp' },
            ExpressionAttributeValues: {
                ':ts': { N: (Date.now() - minutesBack * 60 * 1000).toString() }
            }
        };

        const allEvents = [];
        const uniqueIps = [...new Set((await fetchLoginEvents(await getAdminToken())).map(e => e.ipAddress))];
        
        for (const ip of uniqueIps) {
            params.ExpressionAttributeValues[':ip'] = { S: ip };
            const result = await dynamoClient.send(new QueryCommand(params));
            allEvents.push(...result.Items.map(item => ({
                ipAddress: item.IPAddress.S,
                timestamp: parseInt(item.Timestamp.N),
                type: item.EventType.S,
                hour: parseInt(item.HourOfDay.N)
            })));
        }
        return allEvents;
    }
    // Prepare features for ML
    prepareFeatures = async (events) => {
        const byIp = events.reduce((acc, e) => {
            acc[e.ipAddress] = acc[e.ipAddress] || { logins: 0, failures: 0, hours: new Set() };
            e.type === 'LOGIN' ? acc[e.ipAddress].logins++ : acc[e.ipAddress].failures++;
            acc[e.ipAddress].hours.add(e.hour);
            return acc;
        }, {});

        return Object.entries(byIp).map(([ip, stats]) => ({
            ip,
            logins: stats.logins,
            failures: stats.failures,
            hourDiversity: stats.hours.size,
            ratio: stats.failures / (stats.logins + stats.failures || 1)
        }));
    }
    analyzeForAnomalies = async (events) => {
        const historicalEvents = await fetchHistoricalData();
        const allEvents = [...historicalEvents, ...events];
        const featureData = prepareFeatures(allEvents);
    
        if (featureData.length < 2) {
            console.log('Insufficient data for anomaly detection');
            return [];
        }
    
        const dataMatrix = featureData.map(f => f.features);
        const forest = new IsolationForest({ nTrees: 100, sampleSize: 256 });
        forest.fit(dataMatrix);
    
        const scores = forest.predict(dataMatrix);
        // Lower scores indicate anomalies (typically < 0.5 is considered anomalous)
        return featureData
            .map((item, i) => ({ ...item.metadata, ip: item.ip, score: scores[i], isAnomaly: scores[i] < 0.5 }))
            .filter(item => item.isAnomaly);
    }
    async process(event, context, callback) {
        const awsManager = new awsmanager();
        //var monitoring_db_conn = null;


        try{
            const token = await this.getAdminToken();
            const events = await this.fetchLoginEvents(token);
            
            if (!events.length) {
                return { statusCode: 200, body: JSON.stringify({ message: 'No events to process' }) };
            }

            await this.storeEvents(events);
            const anomalies = await this.analyzeForAnomalies(events);
            console.log(anomalies);
            //let SQS = new AWS.SQS({region:REGION});
            /*if(results.length > 0){
                const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
                for(const result of results){
                    const event_id = await helper.createEventId(result.Tenant,result.Name);
                    let obj = {
                        event_id:event_id,
                        event_type: 'VPN_STATUS',
                        source_system: `BankOS`,
                        tenant_name: result.Tenant,
                        details: JSON.stringify(result),
                        description:result.Description
                    };
                    if (queueUrl) {
                        const sent = await helper.sendExpirationSQSMessageJSON(obj, queueUrl,SQS);
                        this.log.info("Notification send successfully :: ", obj)
                    }
                }
            }
            
            await helper.register_heartbeat(
                `${MONITORING_SERVICE_URL}/heartbeat`,
                API_KEY,
                awsManager,
                'VPN_STATUS',
                'BankOS',
                `VPN Status Check`
            );*/
        } catch (err) {
            this.log.error(`Internal Server Error: `, err);
            await helper.notify_failure(awsManager,"keycloak-login-monitor",err.message);
            return responseHelper.sendServerErrorResponse({
                message: err.message
            })
        }
    }
}
exports.monitor = async (event, context, callback) => {
    return await new KeycloakLoginMonitor().handler(event, context, callback);
};