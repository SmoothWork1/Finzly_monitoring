class awsmanager {
	constructor() {
		const AWS = require('aws-sdk');
		AWS.config.region = process.env.REGION;
		const dbHelper = require('/opt/modules/common/mysql_helper.js');

		this.log = require("log4js").getLogger();
		this.lambda = new AWS.Lambda();
		this.cognito = new AWS.CognitoIdentityServiceProvider();
		this.utils = require('/opt/modules/common/utils.js');
		this.s3 = new AWS.S3({apiVersion: '2006-03-01'});
		this.sqs = new AWS.SQS({apiVersion: '2012-11-05'});
		this.ses = new AWS.SES({apiVersion: '2012-11-05'});
		this.sts = new AWS.STS({apiVersion: '2011-06-15'});
		this.stepfunction = new AWS.StepFunctions();
		this.lambda = new AWS.Lambda();
		this.fs = require('fs');
		this.uuidv4 = require("uuid");
		this.axios = require("axios");
		this.qs = require("qs");
		this.ssm = new AWS.SSM({'region': process.env.REGION});
		this.mysql = require('mysql2');
		this.connectDB = async function(host, user, pass, db, port) {
			const dbConn = require('/opt/modules/common/mysql_conn.js')(host, user, pass, db, port);
			this.dbHelper = new dbHelper(dbConn);
			return;
		}
		this.getProxyConnection = async function(tenant_id,stage) {
			const dbConn = await require('/opt/modules/common/mysql_proxy_conn.js')(this,tenant_id,stage);
			this.dbHelper = new dbHelper(dbConn);
			return dbConn;
		}
		//this.pgp = require('openpgp');
		this.nodeMailer = require('nodemailer');
		this.transporter = this.nodeMailer.createTransport({
			SES: this.ses
		});
		/*
		console.log('################ SMTP #################');
		console.log(`HOST:${process.env.SMTP_HOST},HOST:${process.env.SMTP_PORT},HOST:${process.env.SMTP_USER},HOST:${process.env.SMTP_PASS}`);
		this.transporter = this.nodeMailer.createTransport({
			host:process.env.SMTP_HOST,
          	port:process.env.SMTP_PORT,
          	auth:{
            	user:process.env.SMTP_USER,
            	pass:process.env.SMTP_PASS
          	}
		});
		*/
	}
}
  
awsmanager.prototype.constructor = awsmanager;
var normalizedPath = require("path").join(__dirname, "awsmanager-func");
var normalizedSharedQueriesPath = require("path").join(__dirname, "shared-queries")

require("fs").readdirSync(normalizedPath).forEach(function(file) {
	require("./awsmanager-func/" + file)(awsmanager);
});

require("fs").readdirSync(normalizedSharedQueriesPath).forEach(function(file) {
	require("./shared-queries/" + file)(awsmanager);
});

module.exports = awsmanager;