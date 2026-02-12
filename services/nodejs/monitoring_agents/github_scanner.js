const BaseHandler = require('/opt/modules/common/basehandler');
const awsmanager = require('/opt/modules/common/awsmanager');
const axios = require('axios');
const path = require('path');
const AWS = require("aws-sdk");
const helper = require('./helper.js');
const responseHelper = require('/opt/modules/common/response');
const { STAGE,REGION} = process.env;


const GITHUB_API_BASE = 'https://api.github.com';
const OWNER = 'swapstech';
const REPO = 'galaxy-ach';
//const SECRET_ID = '';
const SECRET_ID = '';
const patterns = {
    awsAccessKey: /(AKIA[0-9A-Z]{16})/g,
    awsSecretKey: /([0-9a-zA-Z/+]{40})/g,
    password: /(password|pwd|pass)\s*[:=]\s*['"]?([^\s'"]+)['"]?/gi,
    genericSecret: /(secret|key|token)\s*[:=]\s*['"]?([^\s'"]+)['"]?/gi
};


class GithubScanner extends BaseHandler {
    constructor() {
        super();
    }
    async generateUniqueId() {
        const timestamp = Date.now().toString(36); // Base-36 timestamp (shorter than decimal)
        const randomStr = Math.random().toString(36).substring(2, 8); // 6 random chars
        return `${timestamp}-${randomStr}`;
    }
    // async getSecretValue(secretId) {
    //     const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
    //     const client = new SecretsManagerClient({ region: 'us-east-1' }); // Adjust region as needed
    //     const command = new GetSecretValueCommand({ SecretId: secretId });
    //     const response = await client.send(command);
    //     return JSON.parse(response.SecretString).github_pat; // Assumes PAT is stored as 'github_pat' key
    // }
    async  scanFileContent(content, filePath,repo_name) {
        const findings = [];
        const decodedContent = Buffer.from(content, 'base64').toString('utf-8');

        for (const [type, pattern] of Object.entries(patterns)) {
          const matches = [...decodedContent.matchAll(pattern)];
          if (matches.length > 0) {
            matches.forEach(match => {
                findings.push({
                    repo:repo_name,
                    type,
                    value: match[0],
                    file: filePath,
                    context: decodedContent.slice(Math.max(0, match.index - 20), match.index + 40)
                });
            });
          }
        }
        return findings;
    }
    async scan(awsManager) {
         try{
            // Fetch GitHub PAT from Secrets Manager
            //const token = await getSecretValue(SECRET_ID);
            const PER_PAGE = 100;
            let allRepos = [];
            let page = 1;
            let hasMore = true;
            const file_entensions = ["java", "js", "properties","txt","json"];
            const findings = [];
            const token = SECRET_ID;
            const headers = { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' };
            while (hasMore) {
                const params={
                    per_page: PER_PAGE,
                    page: page,
                }
                const repos = await axios.get(`${GITHUB_API_BASE}/user/repos`,{headers,params});
                for(const repo of repos.data){
                    allRepos.push({name:repo.name,owner:repo.owner.login});
                }
                const linkHeader = repos.headers.link;
                hasMore = linkHeader && linkHeader.includes('rel="next"');
                page++;
            }
            console.log(`##Total Repos to Scan:${allRepos.length}`);
            for(const repo of allRepos){
                //console.log(JSON.stringify(repo.owner));
                console.log(`--> Scanning ${repo.name}`);
                try{
                    // Get repository contents (root level)
                    const repoUrl = `${GITHUB_API_BASE}/repos/${repo.owner}/${repo.name}/contents`;
                    const { data: contents }  = await axios.get(repoUrl,{headers});
                    // Process each file or directory recursively
                    for (const item of contents) {
                             

                        if (item.type === 'file') {
                            const extension = path.extname(item.path).toLowerCase().slice(1);
                            const containsAny = file_entensions.some(word => extension.includes(word));
                            if(!containsAny || item.path.indexOf('package-lock.json') < 0){
                                continue;
                            }
                            const { data: fileData } = await axios.get(item.url, { headers });
                            const fileFindings = await this.scanFileContent(fileData.content, item.path,repo.name);
                            findings.push(...fileFindings);
                        } else if (item.type === 'dir') {
                            // Recursive call for directories (simplified here; expand as needed)
                            const dirUrl = `${GITHUB_API_BASE}/repos/${repo.owner}/${repo.name}/contents/${item.path}`;
                            const { data: dirContents } = await axios.get(dirUrl, { headers });
                            for (const subItem of dirContents) {
                                if (subItem.type === 'file') {
                                    const extension = path.extname(subItem.path).toLowerCase().slice(1);
                                    const containsAny = file_entensions.some(word => extension.includes(word));
                                    if(!containsAny){
                                        continue;
                                    }
                                    const { data: subFileData } = await axios.get(subItem.url, { headers });
                                    const subFileFindings = await this.scanFileContent(subFileData.content, subItem.path,repo.name);
                                    findings.push(...subFileFindings);
                                }
                            }
                        }
                    }
                }catch(ex){
                    console.log(`Error: failed to fetch details of ${repo.owner.login}/${repo.name}`);
                }
            }
            if (findings.length > 0) {
                for(const finding of findings){
                    console.log(finding);
                }
                //console.log('Sensitive data found:', findings);
                return true;
            }
            return false;
        }catch(ex){
            console.log(ex);
        }
    }
    async process(event, context, callback) {
        const awsManager = new awsmanager();
        //var monitoring_db_conn = null;
        try{
            await this.scan(awsmanager);
            
        } catch (err) {
            this.log.error(`Internal Server Error: `, err);
            //await helper.notify_failure(awsManager,"stuck-payments",err.message);
            // return responseHelper.sendServerErrorResponse({
            //     message: err.message
            // })
        }
        // finally{
        //     if (monitoring_db_conn && monitoring_db_conn.end) {
        //         monitoring_db_conn.end();
        //     }
        // }
    }
}
exports.scan = async (event, context, callback) => {
    return await new GithubScanner().handler(event, context, callback);
};