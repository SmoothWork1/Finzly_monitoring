const fs = require('fs');
const Client = require('ssh2').Client;

const tail_file = async (input) => {
    const conn = new Client();
    conn.on('ready', function() {
        conn.exec('tail -f /log/engines/ReutersWebSocketEngine.out | grep "Message received"', function(err, stream) {
          if (err){
            throw err;
          }
          stream.on('close', function(code, signal) {
            console.log('Stream closed with code ' + code);
            conn.end();
          }).on('data', function(data) {
            console.log(data.toString());
          }).stderr.on('data', function(data) {
            console.log('STDERR: ' + data);
          });
        });
    }).connect({
        host: profile.host,
        port: 22,
        username: profile.user,
        privateKey: fs.readFileSync(profile.private_key)
    });
}



const process = async (params) => {
    try{
        let rawdata = fs.readFileSync(`./input/${params.tenant}.json`).toString();
        let profiles = JSON.parse(rawdata);
        for(const profile of profiles){
            await find_processes_new(profile);
        }
        console.log(profile)
    }catch(err){}
    //await find_processes();
}
const run = async () => {
    const input = {
        tenant:'fcb'
    }
    await tail_file(input);
    //await process(input);
};

run();