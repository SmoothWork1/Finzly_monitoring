module.exports = async function (awsmanager) {
	awsmanager.prototype.sendSQSMessageJSON = function(obj, fileName) {
		return new Promise( (resolve, reject) => {
			this.sqs.sendMessage({
				// DelaySeconds: 20,
				MessageAttributes: {
					"fname": {
						DataType: "String",
						StringValue: fileName
					},
				},
				MessageBody: JSON.stringify(obj),
				QueueUrl: process.env.SQS_URL
			}, (err, data) => {
				if(err) {
					this.log.error(`SQS for ${fileName}>${obj.customer_id} failed: `, err);
					resolve(false);
					return;
				}
				this.log.info(`SQS for ${fileName}>${obj.customer_id} sent`);
				resolve(true);
			});
		});
	};
	awsmanager.prototype.sendExpirationSQSMessageJSON = function (obj,queueUrl) {
		return new Promise((resolve, reject) => {
			this.sqs.sendMessage({			
				MessageBody: JSON.stringify(obj),
				QueueUrl: queueUrl
			}, (err, data) => {
				if (err) {
					this.log.error(`MONITORING_SQS failed: `, err);
					resolve(false);
					return;
				}
				this.log.info(`MONITORING_SQS sent successfully`);
				resolve(true);
			});
		});
	};
	awsmanager.prototype.sendSQSMessage = function(short_name, full_name, customer_id, fileName) {
		return new Promise( (resolve, reject) => {
			this.sqs.sendMessage({
				// DelaySeconds: 20,
				MessageAttributes: {
					"full_name": {
						DataType: "String",
						StringValue: full_name
					},
					"short_name": {
						DataType: "String",
						StringValue: short_name
					},
					"customer_id": {
						DataType: "String",
						StringValue: customer_id
					},
					"fname": {
						DataType: "String",
						StringValue: fileName
					},
				},
				MessageBody: `Asynchronous Invocation for saving ${customer_id} details to database`,
				QueueUrl: process.env.SQS_URL
			}, (err, data) => {
				if(err) {
					this.log.error(`SQS for ${fileName}>${customer_id} failed: `, err);
					resolve(false);
					return;
				}
				this.log.info(`SQS for ${fileName}>${customer_id} sent`);
				resolve(true);
			});
		});
	};
	awsmanager.prototype.sendSQSMessageByQueueName = function(stringified, bucket, fileName) {
		return new Promise( (resolve, reject) => {
			this.sqs.getQueueUrl({QueueName: bucket}, (err, data) => {
				if(err) {
					this.log.error(`SQS GetQueueURL Error for ${fileName}: `, err);
					resolve(false);
					return;
				}
				const QueueUrl = data.QueueUrl;
				this.sqs.sendMessage({
					// DelaySeconds: 20,
					MessageBody: stringified,
					QueueUrl
				}, (err, data) => {
					if(err) {
						this.log.error(`SQS for ${fileName} failed: `, err);
						resolve(false);
						return;
					}
					this.log.info(`SQS for ${fileName} sent`);
					resolve(true);
				});
			});
		});
	};
	awsmanager.prototype.sendSQSMessageByQueueUrl = function(stringified, QueueUrl, fileName) {
		return new Promise( (resolve, reject) => {
			this.sqs.sendMessage({
				// DelaySeconds: 20,
				MessageBody: stringified,
				QueueUrl
			}, (err, data) => {
				if(err) {
					this.log.error(`SQS for ${fileName} failed: `, err);
					resolve(false);
					return;
				}
				this.log.info(`SQS for ${fileName} sent`);
				resolve(true);
			});
		});
	};
	awsmanager.prototype.sendSQSMessageFIFO = function(stringified, queueUrl, messageGroupID, messageDeduplicationId) {
		return new Promise( (resolve, reject) => {
			this.sqs.sendMessage({
				// DelaySeconds: 20,
				MessageBody: stringified,
				QueueUrl: queueUrl
				//MessageGroupId: messageGroupID,
				//MessageDeduplicationId: messageDeduplicationId
			}, (err, data) => {
				if(err) {
					this.log.error(`SQS failed: `, err);
					resolve(false);
					return;
				}
				resolve(true);
			});
		});
	};
	awsmanager.prototype.sendSQSFIFO = function(stringified, queueUrl, messageGroupID, messageDeduplicationId) {
		return new Promise( (resolve, reject) => {
			const params = {
				// DelaySeconds: 20,
				MessageBody: stringified,
				QueueUrl: queueUrl,
				MessageGroupId: messageGroupID,
				MessageDeduplicationId: messageDeduplicationId
			};
			this.sqs.sendMessage(params, (err, data) => {
				if(err) {
					this.log.error(`SQS failed: `, err);
					resolve(false);
					return;
				}
				resolve(true);
			});
		});
	};
	awsmanager.prototype.sendStandardSQSMessage = function(stringified, queueUrl,msgAttributes) {
		return new Promise( (resolve, reject) => {
			this.sqs.sendMessage({
				// DelaySeconds: 20,
				MessageAttributes: msgAttributes,
				MessageBody: stringified,
				QueueUrl: queueUrl
			}, (err, data) => {
				if(err) {
					this.log.error(`SQS failed: `, err);
					resolve(false);
					return;
				}
				resolve(true);
			});
		});
	};
	awsmanager.prototype.rmSQSMessage = function(ReceiptHandle) {
		return new Promise( (resolve, reject) => {
			this.sqs.deleteMessage({
				QueueUrl: process.env.SQS_URL,
				ReceiptHandle
			}, (err, data) => {
				if(err) {
					this.log.error(`SQS ${ReceiptHandle} delete failed: `, err);
					resolve(false);
					return;
				}
				resolve(true);
			});
		});
	};	
}