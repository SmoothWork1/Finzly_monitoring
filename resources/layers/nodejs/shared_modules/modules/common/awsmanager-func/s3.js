module.exports = async function (awsmanager) {
	const fs = require("fs");
    awsmanager.prototype.getFileByNameS3 = function(name, bucket) {
		return new Promise( (resolve, reject) => {
			const params = {
				Bucket: bucket,
				Key: name
			};
			this.s3.getObject(params).promise()
			.then( (data) => {resolve({...data, success: true})})
			.catch( (err) => {
				this.log.error(`S3 ${name} fetch error: `, err);
				resolve({success: false})
			});
		})
    };

	awsmanager.prototype.getFileObjectByNameS3 = function (fileKey, fileName, bucket) {
		return new Promise((resolve, reject) => {
		  const params = {
			Bucket: bucket,
			Key: fileKey,
		  };
		  this.s3
			.getObject(params)
			.promise()
			.then((data) => {
			fs.writeFile(fileName, ...data, (err) => {
			if (err) throw err});
			  resolve({ fileName, success: true });
			})
			.catch((err) => {
			  this.log.error(`S3 ${name} fetch error: `, err);
			  resolve({ success: false });
			});
		});
	  }

	awsmanager.prototype.putFileToS3 = function(name, bucket, body) {
		return new Promise( (resolve, reject) => {
			const params = {
				Body: body,
				Bucket: bucket,
				Key: name
			};
			this.s3.putObject(params).promise()
			.then( (data) => {resolve(true);})
			.catch( (err) => {
				this.log.error(`S3 ${name} upload error: `, err);
				resolve(false);
			});
		})
    };
	awsmanager.prototype.removeFromS3 = function(name, bucket) {
		return new Promise( (resolve, reject) => {
			const params = {
				Bucket: bucket,
				Key: name
			};
			this.log.info("S3 Params: ", params);
			this.s3.deleteObject(params).promise()
			.then( (data) => {resolve(true);})
			.catch( (err) => {
				this.log.error(`S3 ${name} delete error: `, err);
				resolve(false);
			});
		})
    };
	awsmanager.prototype.putFileToS3 = function(name, bucket, body, ContentType) {
		return new Promise( (resolve, reject) => {
			const params = {
				Body: body,
				Bucket: bucket,
				Key: name,
				ContentType: ContentType
			};
			//console.log("S3 Upload File Body: ", body);
			this.s3.putObject(params).promise()
			.then( (data) => {
				resolve(true);
			}).catch( (err) => {
				console.error(`S3 ${name} upload error: `, err);
				resolve(false);
			});
		})
	};

	awsmanager.prototype.upload = function(fileName, bucketName, fileData) {
		return new Promise(async (resolve, reject) => {
			const params = {
			  Bucket: bucketName,
			  Key: fileName,
			  Body: fileData
			};
			await this.s3.upload(params, (err, data) => {
			  if (err) {
				reject(new Error(`File upload to S3 failed: ${err}`));
			  } else {
				resolve(`File uploaded successfully to S3: ${data.Location}`);
			  }	  
			});
		  });
	};
}