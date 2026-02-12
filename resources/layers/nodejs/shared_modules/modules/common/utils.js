const jwt = require('jsonwebtoken');
const DateExtension = require('joi-date-extensions');
const DecimalExtension = require('joi-decimal');
const BaseJoi = require('joi');
const Joi = BaseJoi.extend(DateExtension).extend(DecimalExtension);

exports.generateRandomID = (min, max) => {
	return (Math.random().toString(36).substring(min+1, max) + Math.random().toString(36).substring(min, max-1)).toUpperCase();
}

exports.getUserPayload = async (authToken) => {
	payload = "";
	try {
		const token = authToken;
		const decoded = jwt.decode(token, {
			complete: true
		});
  
		if (decoded) {
			payload = decoded.payload;
		}
	} catch (err) {
		console.log(err);
	}

	return payload;
}

// This function is used to validate json against a schema
exports.validate = async (json, schema) => {
	return new Promise((resolve, reject) => {
		Joi.validate(json, schema, {
			abortEarly: false
		}, function (err, value) {
			if (err) {
				reject(err);
				return;
			}
			resolve(value);
		});
	});
};

exports.removeEmpty = (obj) => {
	Object.keys(obj).forEach(key => {
	  if (obj[key] && typeof obj[key] === 'object'){
		if(Array.isArray(obj[key])){
		  //Do Nothing for now
		}else{
		  //exports.removeEmpty(obj[key]);
		  var child_obj = obj[key];
		  Object.keys(child_obj).forEach(key => {
			if (child_obj[key] === undefined || child_obj[key] === ''){
			  delete child_obj[key];
			}
		  });
		}
	  } else if (obj[key] === undefined || obj[key] === ''){
		delete obj[key];
	  } 
	});
	return obj;
  };