const mysql = require('mysql2');

const connector = (host, user, password, database, port) => {
	const pool = mysql.createPool({ host, port, user, password, database });
	return pool;
};

module.exports = connector;