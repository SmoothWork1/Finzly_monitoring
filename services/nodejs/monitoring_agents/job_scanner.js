const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const AWS = require("aws-sdk");
const cronParser = require('cron-parser');
const axios = require('axios');
const qs = require('querystring');
const helper = require('./helper.js');
const { STAGE,MONITORING_SQS_NAME,MONITORING_SERVICE_URL,API_KEY,REGION} = process.env;
class JobMonitor extends BaseHandler {
    constructor() {
        super();
    }
    
    async findNearestSmaller (inputNumber, executions) {
        if (!Array.isArray(executions) || executions.length === 0) {
            // Return null or handle it as per your requirement (e.g., throw an exception)
            return null;
        }
        
        let nearest = null;
    
        for (let i = 0; i < executions.length; i++) {
            if (executions[i].startTime < inputNumber && (nearest === null || inputNumber - executions[i].startTime < inputNumber - nearest)) {
                nearest = executions[i].startTime;
            }
        }
    
        return nearest;
    }

    async findNearestSmallerForCron (inputNumber, times) {
        if (!Array.isArray(times) || times.length === 0) {
            // Return null or handle it as per your requirement (e.g., throw an exception)
            return null;
        }

        const now = new Date();
        const thirtyMinutesLater = new Date(inputNumber - 30 * 60 * 1000);
    
        for (let i = 0; i < times.length; i++) {
            const cronTime = new Date(times[i]);

            if (cronTime >= thirtyMinutesLater && cronTime <= now) {
                return cronTime;
            }
        }
    
        return null;
    }
    
    async authenticate(params) {
        const resp = await axios.post(params.url, qs.stringify({
            action: "login",
            username: params.username,
            password: params.password
        }), {});
        return resp.data.status === 'success' ? resp.data['session.id'] : null;
    }

    async fetchProjectFlows(params, sessionId, project) {
        const resp = await axios.get(`${params.url}manager?session.id=${sessionId}&ajax=fetchprojectflows&project=${project}`, {});
        return resp.data.flows ? { proj_id: resp.data.projectId, flows: resp.data.flows } : null;
    }

    async fetchFlowSchedule(params, sessionId, projId, flow) {
        const resp = await axios.get(`${params.url}schedule?session.id=${sessionId}&ajax=fetchSchedule&projectId=${projId}&flowId=${flow.flowId}`, {});
        return resp.data.schedule ? { flowId: flow.flowId, cron: resp.data.schedule.cronExpression } : null;
    }

    convertEstJobTime(estJobTimeString) {
        const [datePart, timePart] = estJobTimeString.split(", ");
        const [month, day, year] = datePart.split("/");
        const [hour, minute, secondWithSuffix] = timePart.split(":");
        const second = secondWithSuffix.split(" ")[0];
        const ampm = secondWithSuffix.split(" ")[1];

        let hours24 = parseInt(hour, 10);
        if (ampm.toLowerCase() === "pm" && hours24 < 12) {
            hours24 += 12;
        }
        if (ampm.toLowerCase() === "am" && hours24 === 12) {
            hours24 = 0;
        }

        const jobTimeObj = new Date(year, month - 1, day, hours24, minute, second);

        return jobTimeObj;
    }

    async getFlowExecution(params, sessionId, project, flowId, current_time) {
        const resp = await axios.get(`${params.url}manager?session.id=${sessionId}&ajax=fetchFlowExecutions&project=${project}&flow=${flowId}&start=0&length=10`, {});
        const executions = resp.data.executions;

        if(!executions) {
            return null;
        }

        const now = new Date(current_time);
        const thirtyMinutesAgo = new Date(current_time - 30 * 60 * 1000);

        const filteredExecutions = executions.filter(execution => {
            const adjustedStartTime = new Date(execution.startTime);
            // console.log('Filtered Execution Times', new Date(adjustedStartTime).toISOString());
            return adjustedStartTime >= thirtyMinutesAgo && adjustedStartTime <= now;
        });
        return filteredExecutions;
    }

    async checkFlowExecution(closest_job_time, times) {
        const THRESHOLD = 59 * 1000;
        
        if (!Array.isArray(times) || typeof closest_job_time !== 'number') {
            throw new Error('Invalid inputs');
        }
        
        const matchedTimes = times.filter(time => {
            // console.log('Time Frames------------', new Date(time).toISOString());
            return Math.abs(time - closest_job_time) <= THRESHOLD;
        });

        if(matchedTimes && matchedTimes.length > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    // Limit concurrency to avoid timeout issues
    async limitConcurrency(tasks, limit) {
        const result = [];
        const executing = [];
        for (const task of tasks) {
            const p = task().then(res => {
                executing.splice(executing.indexOf(p), 1);
                return res;
            });
            result.push(p);
            executing.push(p);
            if (executing.length >= limit) {
                await Promise.race(executing);
            }
        }
        return Promise.all(result);
    };

    async process(event, context, callback) {
        const awsManager = new awsmanager();
        let SQS = new AWS.SQS({ region: REGION });
        const queueUrl = await helper.getQueueUrl(MONITORING_SQS_NAME, SQS);
        const allTenants = await helper.fetchActiveTenants(STAGE, awsManager);

        for (const obj of allTenants) {
            for (const tenantName of obj.tenants) {
                if(['finzly','testbank'].includes(tenantName)){
                    continue;
                }
                let tenant_stage = obj.stage;
                try {
                    const paramObj = await helper.get_parameter_with_tenant(tenant_stage, tenantName, awsManager);
                    if (!paramObj) continue;

                    const params = {
                        url: paramObj.url.endsWith('/') ? paramObj.url : `${paramObj.url}/`,
                        username: paramObj.username,
                        password: paramObj.password,
                    };

                    const sessionId = await this.authenticate(params);
                    if (!sessionId) {
                        this.log.error(`Failed authentication for tenant: ${tenantName}: `);
                        continue;
                    }
                    
                    try {
                        const projects = [
                            'finzly-deposit', 
                            'finzly-jobs', 
                            'finzly-ach', 
                            'finzly-fedwire', 
                            'finzly-payment', 
                            'finzly-legalentity',
                            'finzly-notifications', 
                            'finzly-accounting', 
                            'finzly-compliance', 
                            'finzly-fee', 
                            'finzly-ird', 
                            'finzly-confirms',
                            'finzly-nostro', 
                            'finzly-staticData', 
                            'finzly-marketdata',
                            'finzly-rtp', 
                            'finzly-fednow', 
                            'finzly-datamigration', 
                            'finzly-closebooks'
                        ];
                        projects.push(`'${tenantName}clientadapter'`);

                        const flowPromises = projects.map(project => async () => {
                            const projectFlows = await this.fetchProjectFlows(params, sessionId, project);
                            if (projectFlows) {
                                const schedulePromises = projectFlows.flows.map(flow => async () => {
                                    const flowSchedule = await this.fetchFlowSchedule(params, sessionId, projectFlows.proj_id, flow);
                                    if (flowSchedule) {
                                        const now = new Date();
                                        const startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // Subtract 1 day in milliseconds
                                        const endDate = new Date(now.getTime() + (1 * 60 * 60 * 1000));
                                        const options = { currentDate: startDate, endDate: endDate, iterator: true, utc: true };

                                        console.log('Cron Expression---------', flowSchedule.cron);
                                        const interval = cronParser.parseExpression(flowSchedule.cron, options);

                                        let times = [];
                                        while (true) {
                                            try {
                                                const obj = interval.next();
                                                times.push(new Date(obj.value).getTime() + (4 * 60 * 60 * 1000));
                                            } catch (e) {
                                                break;
                                            }
                                        }

                                        if(times && times.length > 0) {
                                            const current_time = now.getTime();
                                            console.log('Current Time:', new Date(current_time).toISOString());
                                            const executions = await this.getFlowExecution(params, sessionId, project, flowSchedule.flowId, current_time);
                                            if(executions && executions.length > 0) {
                                                executions.map(async execution => {
                                                    if (execution.status != 'SUCCEEDED') {
                                                        const estJobTimeString = new Date(execution.startTime).toLocaleString('en-US', { timeZone: 'America/New_York' });
                                                        const jobTimeObj = this.convertEstJobTime(estJobTimeString);
                                                        const event_name = `${flowSchedule.flowId}-${jobTimeObj.getHours()}-${jobTimeObj.getMinutes()}`;
                                                        const event_id = await helper.createEventId(tenantName, event_name);
                                            
                                                        const obj = {
                                                            event_id: event_id,
                                                            event_type: 'JOB_EXECUTION_FAILURE',
                                                            source_system: `${tenantName}/${flowSchedule.flowId}`,
                                                            tenant_name: tenantName,
                                                            details: JSON.stringify({ Tenant: tenantName, ExecutionTime: `${estJobTimeString}` }),
                                                            description: `Job execution was failed at ${estJobTimeString}`
                                                        };
                                            
                                                        if (queueUrl) {
                                                            await helper.sendExpirationSQSMessageJSON(obj, queueUrl, SQS);
                                                            this.log.info("Notification sent successfully :: ", obj);
                                                        }
                                                    }
                                                })

                                                console.log('Main Processing ............');
                                                const closest_job_time = await this.findNearestSmaller(current_time, executions);
                                                const estJobTimeString = new Date(closest_job_time).toLocaleString('en-US', {timeZone: 'America/New_York'});
                                                const jobTimeObj = this.convertEstJobTime(estJobTimeString);
                                                const successful = await this.checkFlowExecution(closest_job_time, times);

                                                if (successful) {
                                                    console.log(`flow:${flowSchedule.flowId} is successfully executed at ${jobTimeObj.getHours()}:${jobTimeObj.getMinutes()} EST`)
                                                } else {
                                                    const event_name = `${flowSchedule.flowId}-${jobTimeObj.getHours()}-${jobTimeObj.getMinutes()}`;
                                                    const event_id = await helper.createEventId(tenantName, event_name);
                                                    const obj = {
                                                        event_id: event_id,
                                                        event_type: 'JOB_EXECUTION_FAILURE',
                                                        source_system: `${tenantName}/${flowSchedule.flowId}`,
                                                        tenant_name: tenantName,
                                                        details: JSON.stringify({ Tenant: tenantName, ExecutionTime: `${ estJobTimeString }` }),
                                                        description: `Job not executed at ${ estJobTimeString }`
                                                    };

                                                    if (queueUrl) {
                                                        await helper.sendExpirationSQSMessageJSON(obj, queueUrl, SQS);
                                                        this.log.info("Notification send successfully :: ", obj)
                                                    }
                                                }
                                            }
                                            else {
                                                console.log('Additional Processing ............');
                                                const between_cron_time = await this.findNearestSmallerForCron(current_time, times);
                                                if(between_cron_time) {
                                                    const estJobTimeString = new Date(between_cron_time).toLocaleString('en-US', {timeZone: 'America/New_York'});
                                                    const jobTimeObj = this.convertEstJobTime(estJobTimeString);
                                                    const event_name = `${flowSchedule.flowId}-${jobTimeObj.getHours()}-${jobTimeObj.getMinutes()}`;
                                                    const event_id = await helper.createEventId(tenantName, event_name);
                                                    
                                                    const obj = {
                                                        event_id: event_id,
                                                        event_type: 'JOB_EXECUTION_FAILURE',
                                                        source_system: `${tenantName}/${flowSchedule.flowId}`,
                                                        tenant_name: tenantName,
                                                        details: JSON.stringify({ Tenant: tenantName, ExecutionTime: `${ estJobTimeString }` }),
                                                        description: `Job not executed at ${ estJobTimeString }`
                                                    };

                                                    if (queueUrl) {
                                                        await helper.sendExpirationSQSMessageJSON(obj, queueUrl, SQS);
                                                        this.log.info("Notification send successfully :: ", obj)
                                                    }
                                                }
                                            }
                                        }
                                    }
                                });

                                await this.limitConcurrency(schedulePromises, 5); // Limit concurrent flow schedule checks to 5
                            }
                        });

                        await this.limitConcurrency(flowPromises, 2); // Limit concurrent project fetches to 2
                    } catch (ex) {
                        console.log('Failed execute queries ', ex);
                    }
                } catch (e) {
                    this.log.error(`Failed getting credential for tenant: ${tenantName}: `, e);
                }
            }
        }
        await helper.register_heartbeat(
            `${MONITORING_SERVICE_URL}/heartbeat`,
            API_KEY,
            awsManager,
            'JOB_EXECUTION_FAILURE',
            `BankOS`,
            `Azkaban Job execution monitor.`
        );
    }
}

exports.scheduler = async (event, context, callback) => {
    return await new JobMonitor().handler(event, context, callback);
};