import http from './amplifyApi';

// Tenant
export const saveTenantReq = (data) => {
	return http.post('tenants', ``, data); // { id, display_name, status }
};
export const getTenantsReq = () => {
	return http.get('tenants', ``);
};
export const updTenantReq = (data) => {
	return http.put('tenants', ``, data); // { id, display_name, status }
};
export const rmTenantReq = (tenantid) => {
	return http.del('tenants', `/${tenantid}`);
};

// Release
export const saveReleaseReq = (data) => {
	return http.post('releases', ``, data); // { id, display_name, branch, status }
};
export const getReleasesReq = () => {
	return http.get('releases', ``);
};
export const updReleaseReq = (data) => {
	return http.put('releases', ``, data); // { id, display_name, branch, status }
};
export const rmReleaseReq = (releaseid) => {
	return http.del('releases', `/${releaseid}`);
};

// Environment
export const saveEnvironmentReq = (data) => {
	return http.post('environments', ``, data); // { id, display_name, status }
};
export const getEnvironmentsReq = () => {
	return http.get('environments', ``);
};
export const updEnvironmentReq = (data) => {
	return http.put('environments', ``, data); // { id, display_name, status }
};
export const rmEnvironmentReq = (environmentid) => {
	return http.del('environments', `/${environmentid}`);
};

// Tenant Environment
export const saveTenantEnvironmentReq = (data) => {
	return http.post('tenants-environments', ``, data); // { tenant_id, env_id, status }
};
export const getTenantEnvironmentsReq = () => {
	return http.get('tenants-environments', ``);
};
export const updTenantEnvironmentReq = (data) => {
	return http.put('tenants-environments', ``, data); // { id, tenant_id, env_id, status }
};
export const rmTenantEnvironmentReq = (tenantenvid) => {
	return http.del('tenants-environments', `/${tenantenvid}`);
};

// Release Environment
export const saveReleaseEnvironmentReq = (data) => {
	return http.post('releases-environments', ``, data); // { release_id, env_id, status }
};
export const getReleaseEnvironmentsReq = () => {
	return http.get('releases-environments', ``);
};
export const updReleaseEnvironmentReq = (data) => {
	return http.put('releases-environments', ``, data); // { id, release_id, env_id, status }
};
export const rmReleaseEnvironmentReq = (releaseenvid) => {
	return http.del('releases-environments', `/${releaseenvid}`);
};

// Execution Info
export const saveExecInfoReq = (data) => {
	return http.post('execution-info', ``, data); // { env_id, tenant_id, release_id, status }
};
export const getExecInfoReq = () => {
	return http.get('execution-info', ``);
};
export const updExecInfoReq = (data) => {
	return http.put('execution-info', ``, data); // { id, env_id, tenant_id, release_id, status }
};
export const rmExecInfoReq = (execinfoid) => {
	return http.del('execution-info', `/${execinfoid}`);
};
export const launchExecInfoReq = (execinfoid) => {
	return http.post('executions', `/${execinfoid}`, {});
};

// Configuration
export const saveConfigReq = (data) => {
	return http.post('configurations', ``, data); // { field_group, application, property_key, property_value, target, type, status }
};
export const getConfigsReq = (params) => {
	return http.get('configurations', ``, params); // { field_group, application, property_key, property_value, product, app_code, target, type, status }
};
export const updConfigReq = (data) => {
	return http.put('configurations', ``, data); // { field_group, application, property_key, property_value, target, type, created_on, updated_on, status }
};
export const rmConfigReq = (propkey) => {
	return http.del('configurations', `/${propkey}`);
};

// Applications
export const saveApplicationReq = (data) => {
	return http.post('applications', ``, data); // { app_name, app_code, app_context, schema, is_default_app, group, enable_api, api_code, status }
};
export const getApplicationsReq = () => {
	return http.get('applications', ``);
};
export const updApplicationReq = (data) => {
	return http.put('applications', ``, data); // { id, app_name, app_code, app_context, schema, is_default_app, group, enable_api, api_code, status }
};
export const rmApplicationReq = (appid) => {
	return http.del('applications', `/${appid}`);
};

// DevOps Properties
export const saveDevOpsPropReq = (data) => {
	return http.post('devops-properties', ``, data); // { key, value, env, status }
};
export const getDevOpsPropsReq = (params) => {
	return http.get('devops-properties', ``, params); // { prop_key, value, env, status }
};
export const updDevOpsPropReq = (data) => {
	return http.put('devops-properties', ``, data); // { key, value, env, status }
};
export const rmDevOpsPropReq = (key) => {
	return http.del('devops-properties', `/${key}`);
};

// Onboarding Questions
export const saveOnboardingQuestionReq = (data) => {
	return http.post('onboarding-questions', ``, data); // { question, key, value, type, product, application, status }
};
export const getOnboardingQuestionsReq = (params) => {
	return http.get('onboarding-questions', ``, params); // { ques_key, question, product, application, status }
};
export const getExecInfoQuestionsReq = (execinfoid) => {
	return http.get('onboarding-questions', `/exec_info/${execinfoid}`);
}; // {application_id: [...questions], ...}
export const updOnboardingQuestionReq = (data) => {
	return http.put('onboarding-questions', ``, data); // { question, key, value, type, product, application, status }
};
export const rmOnboardingQuestionReq = (key) => {
	return http.del('onboarding-questions', `/${key}`);
};

// DB Schema Updates
export const saveDBSchemaUpdateReq = (data) => {
	return http.post('db-schema-updates', ``, data); // { app_code, entity_type, sql, order, release, status, comments }
};
export const getDBSchemaUpdatesReq = () => {
	return http.get('db-schema-updates', ``);
};
export const updDBSchemaUpdateReq = (data) => {
	return http.put('db-schema-updates', ``, data); // { id, app_code, entity_type, sql, order, release, status, comments }
};
export const rmDBSchemaUpdateReq = (id) => {
	return http.del('db-schema-updates', `/${id}`);
};

// Staging
// export const saveStagingsReq = (data) => {
// 	return http.post('stagings', ``, data); // [{ execution_id, staging_key, value, status, application_id }]
// };
// export const getExecInfoStagingsReq = (execinfoid) => {
// 	return http.get('stagings', `/${execinfoid}`);
// };
// export const updStagingsReq = (data) => {
// 	return http.put('stagings', ``, data); // [{ id, execution_id, staging_key, value, status, application_id }]
// };

// Execution Input
export const saveExecInputsReq = (data) => {
	return http.post('exec-inputs', ``, data); // [{ execution_id, question_key, value }]
};
export const getExecInputsReq = (execinfoid) => {
	return http.get('exec-inputs', `/${execinfoid}`);
};
export const updExecInputsReq = (data) => {
	return http.put('exec-inputs', ``, data); // [{ id, execution_id, question_key, value }]
};