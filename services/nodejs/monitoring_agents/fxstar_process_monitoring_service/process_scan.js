const fs = require('fs');
const Client = require('ssh2').Client;
var cron = require('node-cron');
const axios = require("axios");
require('dotenv').config();
const MONITORING_SERVICE_URL = process.env.MONITORING_SERVICE_URL;
const API_KEY = process.env.API_KEY;
const TENANT = process.env.TENANT;
const TENANT_NAME = process.env.TENANT_NAME;
const notify_monitoring_service = async (server_ip,server_name,app) =>{
  console.log(`[${server_name}/${server_ip}] - ${app.name} is NOT running`);
  const headers = {
    'x-api-key': API_KEY
  };
  const body = {
    platform:"fxstar",
    application:`${app.name}/${server_ip}`,
    tenant:TENANT,
    description:`${server_name}/${server_ip} is down `,
    date:Date.now()
  }
  try{
    var resp = await axios.post(MONITORING_SERVICE_URL, body, {headers});
    console.log(resp);
  }catch(err){
    console.log(err);
  }
  
}
const running_app = async (server_ip,server_name,app) =>{
  console.log(`[${server_name}/${server_ip}] - ${app.name} is Running`);
}
const scan = async (server_ip,server_name,user_id,private_key,app) => {
    const conn = new Client();
    conn.on('ready', function() {
        conn.exec(`ps -ef | grep "${app.process_name}"`, function(err, stream) {
          if (err){
            throw err;
          }
          stream.on('close', function(code, signal) {
            //console.log('Stream closed with code ' + code);
            conn.end();
          }).on('data', function(stdout) {
            //console.log(stdout.toString());
            const data = stdout.toString().split(/\r?\n/);
              if(data && data.length > 0){
                  var running = false;
                  //console.log(`Length:${data.length}`);
                  for(const record of data){
                      if(record.includes("grep")){
                        continue;
                      }
                      if(record.includes(app.process_name)){
                          running_app(server_ip,server_name,app);
                          running = true;
                          break;
                      }
                  }
                  if(!running){
                      notify_monitoring_service(server_ip,server_name,app);
                  }
              }else{
                  //No process is running
                  notify_monitoring_service(server_ip,server_name,app);
              }
          }).stderr.on('data', function(data) {
            console.log('STDERR: ' + data);
          });
        });
    }).connect({
      host: server_ip,
      port: 22,
      username: user_id,
      privateKey: fs.readFileSync(private_key)
  });
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
const run_process_scan = async (params) => {
    try{
        let rawdata = fs.readFileSync(`./input/${TENANT}.json`).toString();
        let profiles = JSON.parse(rawdata);
        for(const profile of profiles){
          await sleep(2000); //sleep for 2 sec. This is needed if there is any lag in ssh connection to target servers
          for (const app of profile.applications){
            await scan(profile.host,profile.name,profile.user,profile.private_key,app);
          }
        }
    }catch(err){
      console.log(err);
    }

    return;
}
run_process_scan();
//cron.schedule('*/1 * * * *', async () => {
//  console.log('running a task 1 minute');
//  const input = {
//    tenant:'fcb'
//  }
//  await process(input);
//});

/*
const run = async () => {
    const input = {
        tenant:'fcb'
    }
    await process(input);
};

run();*/