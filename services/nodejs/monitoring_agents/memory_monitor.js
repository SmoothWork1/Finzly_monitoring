const fs = require('fs');
const Client = require('ssh2').Client;
var cron = require('node-cron');
const axios = require("axios");
require('dotenv').config();
const MONITORING_SERVICE_URL = process.env.MONITORING_SERVICE_URL;
const API_KEY = process.env.API_KEY;
const TENANT = process.env.TENANT;
const HEAP_LIMIT = process.env.HEAP_LIMIT;
const pid_list = [];
const file = `/tmp/memory.out`;
const notify_monitoring_service = async (app,description) =>{
  const headers = {
    'x-api-key': API_KEY
  };
  const body = {
    platform:"fxstar",
    application:`${app} / Low memory`,
    tenant:TENANT,
    description:`${description}`,
    date:Date.now()
  }
  try{
    var resp = await axios.post(MONITORING_SERVICE_URL, body, {headers});
    console.log(resp);
  }catch(err){
    console.log(err);
  }
}
const generate_memory_file = async (pid,server_ip,server_name,user_id,private_key,app) => {
  return new Promise( (resolve, reject) => {
  const conn = new Client();
  conn.on('ready', function() {
      conn.exec(`sudo jmap -heap ${pid}`, function(err, stream) {
        if (err){
          //throw err;
          reject(err);
        }
        stream.on('close', function(code, signal) {
          conn.end();
          resolve();
        }).on('data', function(stdout) {
          //console.log(stdout.toString());
          const data = stdout.toString().split(/\r?\n/);
          if(data && data.length > 0){
            for(const record of data){
              if(record.trim().length == 0){
                continue;
              }
              if(record.indexOf('Attaching to process') > -1){
                fs.appendFile(file, '----------------------'+"\n",function (err){});
              }
              if(record.indexOf('Eden Space:') > -1){
                fs.appendFile(file, `${record.trim()}${pid}:${app} \n`,function (err){});
              }else{
                fs.appendFile(file, record.trim()+"\n",function (err){});
              }
              /*else if(record.indexOf('From Space:') > -1){
                fs.appendFile(file, `${record.trim()}${pid}:${app} \n`,function (err){});
              }else if(record.indexOf('To Space:') > -1){
                fs.appendFile(file, `${record.trim()}${pid}:${app} \n`,function (err){});
              }else if(record.indexOf('PS Old Generation') > -1){
                fs.appendFile(file, `${record.trim()}:${pid}:${app} \n`,function (err){});
              }else if(record.indexOf('concurrent mark-sweep generation:') > -1){
                fs.appendFile(file, `${record.trim()}${pid}:${app} \n`,function (err){});
              }*/
            }
          }
        }).stderr.on('data', function(data) {
          console.log('STDERR: ' + data);
          resolve();
        });
      });
  }).connect({
    host: server_ip,
    port: 22,
    username: user_id,
    privateKey: fs.readFileSync(private_key)
});
});
}

const memory_check = async () => {
  var array = fs.readFileSync('/tmp/memory.out').toString().split("\n");
  var eden = [];
  var from_space = [];
  var to_space = [];
  var long_lived = [];
  const results = new Map();
  for(i in array) {
      if(array[i].indexOf('Eden Space:') > -1){
        eden.push(parseInt(i));
      }
      /*else if(array[i].indexOf('From Space:') > -1){
        from_space.push(parseInt(i));
      }else if(array[i].indexOf('To Space:') > -1){
        to_space.push(parseInt(i));
      }else if(array[i].indexOf('PS Old Generation') > -1){
        long_lived.push(parseInt(i));
      }else if(array[i].indexOf('concurrent mark-sweep') > -1){
        long_lived.push(parseInt(i));
      }*/
  }
  for(const idx of eden){
    const ary = array[idx].split(':');
    const app = ary[2];
    const txt = array[idx+4];
    if(txt.indexOf('used') == -1){
      continue
    }else{
      const usage_percent_txt = txt.split('%')[0];
      //console.log(`Eden:${app}:${usage_percent_txt}`);
      const usage_percent = parseInt(usage_percent_txt); 
      if(HEAP_LIMIT <= usage_percent){
        results.set(app,`Heap Space usage is ${usage_percent}% It could cause an OutOfMemory`);
      }
    }
    
  }
  /*
  for(const idx of from_space){
    const ary = array[idx].split(':');
    const app = ary[2];
    const txt = array[idx+4];
    if(txt.indexOf('used') == -1){
      continue
    }else{
      const usage_percent_txt = txt.split('%')[0];
      //console.log(`From:${app}:${usage_percent_txt}`);
      const usage_percent = parseInt(usage_percent_txt); 
      if(HEAP_LIMIT <= usage_percent){
        results.set(app,`From Heap Space usage is > ${usage_percent}%`);
      }
    }
  }
  for(const idx of to_space){
    const ary = array[idx].split(':');
    const app = ary[2];
    const txt = array[idx+4];
    if(txt.indexOf('used') == -1){
      continue
    }else{
      const usage_percent_txt = txt.split('%')[0];
      //console.log(`To:${app}:${usage_percent_txt}`);
      const usage_percent = parseInt(usage_percent_txt); 
      if(HEAP_LIMIT <= usage_percent){
        results.set(app,`To Heap Space usage is  ${usage_percent}%`);
      }
    }
  }
  for(const idx of long_lived){
    const ary = array[idx].split(':');
    const app = ary[2];
    const txt = array[idx+4];
    if(txt.indexOf('used') == -1){
      continue
    }else{
      const usage_percent_txt = txt.split('%')[0];
      //console.log(`Swap:${app}:${usage_percent_txt}`);
      const usage_percent = parseInt(usage_percent_txt); 
      if(HEAP_LIMIT <= usage_percent){
        results.set(app,`LongLived Heap space usage is ${usage_percent}%`);
      }
    }
  }
  */
  return results;
}
const scan = async (server_ip, server_name, user_id, private_key, app) => {
  return new Promise( (resolve, reject) => {
    const conn = new Client();
    conn.on('ready', function() {
        conn.exec(`ps -axf | grep "${app.process_name}" | grep -v grep | awk "{print $1}"`, function(err, stream) {
          if (err){
            reject(err);
          }
          stream.on('close', function(code, signal) {
            conn.end();
            resolve();
          }).on('data', function(stdout) {
            const data = stdout.toString().split(/\r?\n/);
              if(data && data.length > 0){
                  var running = false;
                  //console.log(`Length:${data.length}`);
                  // for(const record of data){
                  for(let a = 0; a < data.length; ++a) {
                      const record = data[a];
                      if(record.includes("grep")){
                        continue;
                      }
                      const pid = record.trim().split(' ');
                      if(!pid[0] || pid[0].trim().length==0){
                        continue;
                      }
                      //console.log(`PID:${pid[0]};${app.process_name}`);
                      pid_list.push({
                        "host":server_ip,
                        "name":server_name,
                        "user":user_id,
                        "private_key":private_key,
                        "app":app,
                        "pid":pid[0]
                      });
                  }
                  if(!running){
                      //notify_monitoring_service(server_ip,server_name,app);
                  }
              }else{
                  //No process is running
                  //notify_monitoring_service(server_ip,server_name,app);
              }
          }).stderr.on('data', function(data) {
            console.log('STDERR: ' + data);
            resolve();
          });
        });
    }).connect({
      host: server_ip,
      port: 22,
      username: user_id,
      privateKey: fs.readFileSync(private_key)
  });
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
        for(let i=0;i<profiles.length;i++){
          let profile = profiles[i];
          let applications = profile.applications;
          for(let j=0;j<applications.length; j++){
            let app = applications[j];
            await scan(profile.host,profile.name,profile.user,profile.private_key,app);
          }
        }
        fs.writeFileSync(file, '');
        for(let i=0; i<pid_list.length; i++){
          let pid_obj = pid_list[i];
          if (pid_obj.app.hasOwnProperty("is_java_app") && !pid_obj.app.is_java_app) {
            continue;
          }
          await generate_memory_file(pid_obj.pid,pid_obj.host,pid_obj.name,pid_obj.user,pid_obj.private_key,pid_obj.app.name);
        }
        const results = await memory_check();
        if(results){
          for (const [key, value] of results.entries()) {
            console.log(`${key} = ${value}`);
            notify_monitoring_service(key,value);
          }
        }
    }catch(err){
      console.log(err);
    }

    return;
}
run_process_scan();