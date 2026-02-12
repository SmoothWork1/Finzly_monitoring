module.exports = async function (awsmanager) {
	awsmanager.prototype.getStoreParameters = async function(Names) {
		const params = {
			Names,
			WithDecryption: true
		};
		return this.ssm.getParameters(params).promise()
		.then( (data) => {
			//this.log.info("Parameters: ", data.Parameters.map( (p) => p.Name));
			//this.log.info("Keys: ", Names);
			//this.log.info("Length Check: ", data.Parameters.length, Names.length);
			if(data.Parameters.length === Names.length) {
				return data.Parameters; // [{ Name, Type, Value, Version, Selector, SourceResult, LastModifiedDate, ARN, DataType }]
			} else {
				if(data.Parameters.length) {
					this.log.error("Failure to fetch some parameters");
				} else {
					this.log.error("Failure to fetch all parameters");
				}
				return false;
			}
		}).catch( (err) => {
			this.log.error("Get parameters error: ", err);
			return false;
		});
	};
	awsmanager.prototype.objectifyParams = function(Parameters) {
		let obj = {};
		for(let i = 0; i <= Parameters.length; ++i) {
			if(i === Parameters.length) {
				return obj;
			} else {
				obj[Parameters[i].Name] = Parameters[i].Value;
			}
		}
	};
	awsmanager.prototype.deleteStoreParameter = async function(Name) {
		const params = {
			Name
		};
		return this.ssm.deleteParameter(params).promise()
		.then( (data) => {
			this.log.info("Delete parameter success: ", data);
			return true;
		}).catch( (err) => {
			this.log.error("Delete parameter error: ", err);
			return false;
		});
	};
	awsmanager.prototype.saveStoreParameter = async function(Name, Value) {
		const params = {
			Name,
			Value,
			Type: 'String'
		};
		return this.ssm.putParameter(params).promise()
		.then( (data) => {
			this.log.info("Put parameter success: ", data);
			return true;
		}).catch( (err) => {
			this.log.error("Put parameter error: ", err);
			return false;
		});
	};
	awsmanager.prototype.getStoreParameter = async function(Name) {
		const params = {
			Name
		};
		return this.ssm.getParameter(params).promise()
		.then( (data) => {
			this.log.info("Get parameter success: ", data);
			return data;
		}).catch( (err) => {
			this.log.error("Get parameter error: ", err);
			return false;
		});
	};
    // awsmanager.prototype.getParameters = async function(keys) {
    //     const params = {
	// 		Names: keys,
	// 		WithDecryption: true
	// 	};
	// 	return await this.ssm.getParameters(params).promise();
    // };
	// awsmanager.prototype.getParameter = async function(key) {
    //     const params = {
	// 		Name: key,
	// 		WithDecryption: true
	// 	};
	// 	return await this.ssm.getParameter(params).promise();
    // };
}