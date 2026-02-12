const mysql = require("mysql2");
module.exports = async function (awsmanager) {

    awsmanager.prototype.createConnectionWithTenantDb = async (stage, tenant_name, awsManager) => {   
        const baseParamDB = `/config/bankos/global_${stage}/bankos.tenant.${tenant_name}.db.`;
        const dbHostKey = `${baseParamDB}host`;
        const dbPortKey = `${baseParamDB}port`;
        const dbUserKey = `${baseParamDB}username`;
        const dbPassKey = `${baseParamDB}password`;
        console.log('baseParamDB :', baseParamDB)
        let requiredParams = [dbHostKey, dbPortKey, dbUserKey, dbPassKey];
        const paramsFormStore = await awsManager.getStoreParameters(requiredParams);
        if (!paramsFormStore) {
            return;
        }
        else {
            const paramObj = await awsManager.objectifyParams(paramsFormStore);
            const connection = mysql.createConnection({
                host: paramObj[dbHostKey],
                port: paramObj[dbPortKey],
                user: paramObj[dbUserKey],
                password: paramObj[dbPassKey]
            });
            return connection;
        }
    };

    awsmanager.prototype.executeQuery = async (qry,connection) => {
        return new Promise((resolve,reject) => {
            console.log(qry + ";");
            connection.query(qry, function(err, results, fields) {
                if(err) {
                    console.log(err.message);
                    return reject(err)
                }
                return resolve(results);
            });
        });
    }
}