const responseHandler = require("/opt/modules/common/response");
const BaseHandler = require("/opt/modules/common/basehandler");
const awsmanager = require('/opt/modules/common/awsmanager');
const axios = require('axios');
const qs = require('querystring');
const helper = require('./helper/helper.js');
const { getConfigParameterWithTenant } = require("./helper/sql-monitoring.js");
const { STAGE } = process.env;

class GetJobConfigs extends BaseHandler {
    constructor() {
        super();
    }

    async process(event, context, callback) {
        let selected_stage = event.pathParameters.selected_stage;
        let selected_tenant = event.pathParameters.selected_tenant;
    
        console.log('Selected Stage:', selected_stage);
        console.log('Selected Tenant:', selected_tenant);
        const awsManager = new awsmanager();
        try {
            const dbHelper = await helper.create_db_connection_with_config(awsManager, STAGE);
            const param_record = await getConfigParameterWithTenant(dbHelper, selected_tenant, selected_stage);
            const paramObj = await helper.get_parameter_with_tenant(selected_stage, selected_tenant, awsManager);
            console.log('DB record: ', param_record);
            console.log('Parameter Store obj', paramObj);
            if(param_record && paramObj) {
                const params = {
                    url: param_record.url.endsWith('/') ? param_record.url : `${param_record.url}/`,
                    username: param_record.username,
                    password: paramObj.password
                }

                const session_id = await this.authenticate(params);

                if (session_id) {
                    const job_configs = await this.fetchJobConfigs(params, session_id, selected_tenant);
                    return responseHandler.sendSuccessResponse({ job_configs });
                } else {
                    return responseHandler.sendBadReqResponse({ message: `Failed authentication for tenant: ${selected_tenant}: ` });
                }
            }
        }
        catch(e) {
            this.log.error(`Failed getting credential for tenant: ${selected_tenant}: `, e);
            return responseHandler.sendBadReqResponse({message: `Failed getting credential for tenant: ${selected_tenant}: `});
        }
    }

    async authenticate(params) {
        try {
            const resp = await axios.post(params.url, qs.stringify({
                action: "login",
                username: params.username,
                password: params.password
            }), {});
            if (resp && resp.data.status === 'success') {
                return resp.data['session.id'];
            }
        } catch (e) {
            console.error('Authentication failed', e);
        }
        return null;
    }

    async fetchJobConfigs(params, session_id, selected_tenant) {
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
        projects.push(`'${selected_tenant}clientadapter'`);

        const projectResults = await this.concurrentLimit(projects.map(project => () => this.fetchProjectFlows(params, session_id, project)), 2);
        return [].concat(...projectResults);
    }

    async fetchProjectFlows(params, session_id, project) {
        try {
            const resp = await axios.get(`${params.url}manager?session.id=${session_id}&ajax=fetchprojectflows&project=${project}`, {});
            const proj_id = resp.data.projectId;
            if (resp.data.flows) {
                const flowResults = await this.concurrentLimit(resp.data.flows.map(flow => () => this.fetchFlowSchedule(params, session_id, project, proj_id, flow)), 5);
                return flowResults.filter(result => result !== null);
            }
        } catch (e) {
            console.error(`Failed processing project ${project}:`, e);
        }
        return [];
    }

    async fetchFlowSchedule(params, session_id, project, proj_id, flow) {
        try {
            const resp = await axios.get(`${params.url}schedule?session.id=${session_id}&ajax=fetchSchedule&projectId=${proj_id}&flowId=${flow.flowId}`, {});
            if (resp.data.schedule) {
                const cron = resp.data.schedule.cronExpression;
                const schedule_id = resp.data.schedule.scheduleId;
                return {
                    id: schedule_id,
                    project: project,
                    project_id: proj_id,
                    flow_id: flow.flowId,
                    cron: cron,
                };
            }
        } catch (e) {
            console.error(`Failed fetching schedule for flow ${flow.flowId}:`, e);
        }
        return null;
    }

    async concurrentLimit(tasks, limit) {
        const results = [];
        const executing = [];

        for (const task of tasks) {
            const p = task().then(res => {
                executing.splice(executing.indexOf(p), 1);
                return res;
            });
            results.push(p);
            executing.push(p);
            if (executing.length >= limit) {
                await Promise.race(executing);
            }
        }
        return Promise.all(results);
    }
}

exports.get_job_configs = async(event, context, callback) => {
    return await new GetJobConfigs().handler(event, context, callback);
};