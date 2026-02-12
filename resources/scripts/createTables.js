const mysql = require('mysql2');
const variables = require('./setupVariables.json');
const { db_host:host, db_user:user, db_pass:password, db_name:database, db_port:port } = variables.mysql;
const pool = mysql.createPool({ host, port, user, password, database });

const createTables = async () => {
	const helper = require('../layers/nodejs/shared_modules/modules/common/mysql_helper');

	const db = new helper(pool);
	// db.query("CREATE TABLE IF NOT EXISTS sftp(id VARCHAR(6) PRIMARY KEY, status VARCHAR(255) NOT NULL, file_name VARCHAR(255) UNIQUE NOT NULL, datetime BIGINT NOT NULL, retry_count INT DEFAULT 0);")
	// .then( () => {
	// 	console.log("SFTP Table Created if did not Exist");
	// }).catch( (err) => {
	// 	console.error("SFTP Table Error: ", err);
	// });
	// db.query("CREATE TABLE IF NOT EXISTS csv_files(id VARCHAR(6) PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL, processing_date BIGINT NOT NULL, success_count INT DEFAULT 0, failed_count INT DEFAULT 0);")
	// .then( () => {
	// 	console.log("CSV Files Table Created if did not Exist");
	// }).catch( (err) => {
	// 	console.error("CSV Files Table Error: ", err);
	// });
	// db.query("CREATE TABLE IF NOT EXISTS csv_data(id VARCHAR(6) PRIMARY KEY, full_name VARCHAR(255) NOT NULL, short_name VARCHAR(255) NOT NULL, customer_id VARCHAR(255) UNIQUE NOT NULL);")
	// .then( () => {
	// 	console.log("CSV Files Table Created if did not Exist");
	// }).catch( (err) => {
	// 	console.error("CSV Files Table Error: ", err);
	// });

	db.query("CREATE SCHEMA IF NOT EXISTS galaxy_monitoring")
	.then( () => {
		console.log("galaxy_monitoring Schema Created if did not Exist");
		db.query("CREATE TABLE IF NOT EXISTS galaxy_monitoring.heartbeats(event_id VARCHAR(255) NOT NULL, source_system VARCHAR(255) NOT NULL, description TEXT NOT NULL, tenant_name VARCHAR(255) NOT NULL, executed_on VARCHAR(255) NOT NULL, UNIQUE(event_id, source_system))")
		.then( () => {
			console.log("galaxy_monitoring Heartbeats Table Created if did not Exist");
		}).catch( (err) => {
			console.error("galaxy_monitoring Heartbeats Table Error: ", err);
		});
		db.query("CREATE TABLE IF NOT EXISTS galaxy_monitoring.users(id VARCHAR(6) PRIMARY KEY, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, contact_number VARCHAR(12) NOT NULL UNIQUE, address TEXT NOT NULL, type VARCHAR(50), conn_id VARCHAR(255) UNIQUE, online BOOLEAN NOT NULL DEFAULT FALSE)")
		.then( () => {
			console.log("galaxy_monitoring Users Table Created if did not Exist");
			db.query("CREATE TABLE IF NOT EXISTS galaxy_monitoring.monitoring(event_id VARCHAR(50) PRIMARY KEY, event_type VARCHAR(50) NOT NULL, source_system VARCHAR(255) NOT NULL, tenant_name VARCHAR(255) NOT NULL, description TEXT NOT NULL, details TEXT NOT NULL, status VARCHAR(50) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, created_by VARCHAR(255) NOT NULL, updated_by VARCHAR(255) NOT NULL, user_id VARCHAR(6) REFERENCES galaxy_monitoring.users(id), severity ENUM('high', 'medium', 'low') DEFAULT 'high')")
			.then( () => {
				console.log("galaxy_monitoring Monitoring Table Created if did not Exist");
				db.query("CREATE TABLE IF NOT EXISTS galaxy_monitoring.user_notifications(user_id VARCHAR(6) NOT NULL REFERENCES galaxy_monitoring.users(id), event_id VARCHAR(50) NOT NULL REFERENCES galaxy_monitoring.monitoring(event_id), UNIQUE(user_id, event_id))")
				.then( () => {
					console.log("galaxy_monitoring User Notifications Table Created if did not Exist");
				}).catch( (err) => {
					console.error("galaxy_monitoring User Notifications Table Error: ", err);
				});
				db.query("CREATE TABLE IF NOT EXISTS galaxy_monitoring.event_comments(event_id VARCHAR(50) NOT NULL REFERENCES galaxy_monitoring.monitoring(event_id), comment TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)")
				.then( () => {
					console.log("galaxy_monitoring Event Comments Table Created if did not Exist");
				}).catch( (err) => {
					console.error("galaxy_monitoring Event Comments Table Error: ", err);
				});
				db.query("CREATE TABLE IF NOT EXISTS galaxy_monitoring.subscribed_events(subscription_id VARCHAR(6) NOT NULL PRIMARY KEY, user_id VARCHAR(6) NOT NULL REFERENCES galaxy_monitoring.users(id), event_type VARCHAR(50) NOT NULL, delivery_method VARCHAR(255) NOT NULL, deliver_to VARCHAR(255) NOT NULL, tenant_name VARCHAR(255), UNIQUE(user_id, event_type))")
				.then( () => {
					console.log("galaxy_monitoring Subscribed Events Table Created if did not Exist");
				}).catch( (err) => {
					console.error("galaxy_monitoring Subscribed Events Table Error: ", err);
				});
				db.query("CREATE TABLE IF NOT EXISTS galaxy_monitoring.flagged_events(flagged_id VARCHAR(6) NOT NULL PRIMARY KEY, created_by VARCHAR(6) NOT NULL REFERENCES galaxy_monitoring.users(id), last_updated_by VARCHAR(6) REFERENCES galaxy_monitoring.users(id), description_substring VARCHAR(255) NOT NULL UNIQUE)")
				.then( () => {
					console.log("galaxy_monitoring Flagged Events Table Created if did not Exist");
				}).catch( (err) => {
					console.error("galaxy_monitoring Flagged Events Table Error: ", err);
				});
			}).catch( (err) => {
				console.error("galaxy_monitoring Monitoring Table Error: ", err);
			});
		}).catch( (err) => {
			console.error("galaxy_monitoring Users Table Error: ", err);
		});
	}).catch( (err) => {
		console.error("galaxy_monitoring Schema Error: ", err);
	});

	db.query("CREATE SCHEMA IF NOT EXISTS data_migration")
	.then( () => {
		console.log("data_migration Schema Created if did not Exist");
		db.query("CREATE TABLE IF NOT EXISTS data_migration.results(file_name VARCHAR(255) UNIQUE NOT NULL, status VARCHAR(255) NOT NULL DEFAULT 'Pending', records_inserted BIGINT DEFAULT 0, records_failed BIGINT DEFAULT 0)")
		.then( () => {
			console.log("data_migration Results Table Created if did not Exist");
		}).catch( (err) => {
			console.error("data_migration Results Table Error: ", err);
		});
	}).catch( (err) => {
		console.error("data_migration Schema Error: ", err);
	});
}

if(require?.main === module) {
	createTables();
} else {
	module.exports = {createTables};
}
