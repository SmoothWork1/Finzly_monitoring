const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const region = process.argv[2] || 'us-east-2';
const bucket = process.argv[3] || `migration.finzly.net`;
const dirPath = `${__dirname}\\migration-service\\build\\`;

let webPolicy = JSON.stringify(require('./s3WebPemissions.json'));
webPolicy = webPolicy.replace(/\{\{bucket\}\}/gi, bucket);
// const host = `somehostname`;
AWS.config.region = region;

function fileAccessRecursive(currentDirPath, callback) {
	const dirContents = fs.readdirSync(currentDirPath)
	for(let i = 0; i < dirContents.length; ++i) {
		const name = dirContents[i];
		var filePath = path.join(currentDirPath, name);
		var stat = fs.statSync(filePath);
		if (stat.isFile()) {
			callback(filePath, stat);
		} else if (stat.isDirectory()) {
			fileAccessRecursive(filePath, callback);
		}
	}
}

// Step 1. Create S3 Bucket
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
var params = {
	ACL: "private",
	Bucket: bucket,
	CreateBucketConfiguration: {
		LocationConstraint: region
	}
};
s3.createBucket(params, function(bucketErr, bucketData) {
	if (bucketErr && bucketErr.code !== "BucketAlreadyOwnedByYou") {
		console.log("Create Bucket Error: ", bucketErr, bucketErr.stack);
	} else {
		console.log(`Bucket ${bucket} created`, bucketData);
		// Step 2. Upload build files to bucket
		fileAccessRecursive(dirPath, function(filePath, stat) {
			// let bucketPath = filePath.substring(dirPath.length+1);
			let bucketPath = (filePath.replace(dirPath, '')).replace(/\\/g, '/');
			let params = { Bucket: bucket, Key: bucketPath, Body: fs.readFileSync(filePath) };
			if(bucketPath === 'index.html') {
				params["ContentType"] = 'text/html';
			}
			if(bucketPath.endsWith('css')) {
				params["ContentType"] = 'text/css';
			}
			if(bucketPath.endsWith('js')) {
				params["ContentType"] = 'text/javascript';
			}
			s3.putObject(params, function(err, data) {
				if (err) {
					console.log(`${bucketPath} Upload Error: ${err}`);
				} else {
					console.log(`Successfully uploaded ${bucketPath} to ${bucket}`);
				}
			});
		}, false);

		// Step 3. Attach all access policy to S3 Bucket
		const policyParams = {
			Bucket: bucket,
			Policy: webPolicy
		};
		s3.putBucketPolicy(policyParams, function(policyErr, policyData) {
			if (policyErr) {
				console.log("Bucket Policy Error: ", policyErr, policyErr.stack);
			} else {
				console.log("Bucket Policy Attached: ", policyData);
			}
		});

		// Step 4. Setup website configurations for bucket
		const webParams = {
			Bucket: bucket, /* required */
			WebsiteConfiguration: { /* required */
				ErrorDocument: {
					Key: 'index.html' /* required */
				},
				IndexDocument: {
					Suffix: 'index.html' /* required */
				},
				// RedirectAllRequestsTo: {
				// 	HostName: host, /* required */
				// 	Protocol: http | https
				// },
				// RoutingRules: [
				// 	{
				// 		Redirect: { /* required */
				// 			HostName: 'STRING_VALUE',
				// 			HttpRedirectCode: 'STRING_VALUE',
				// 			Protocol: http | https,
				// 			ReplaceKeyPrefixWith: 'STRING_VALUE',
				// 			ReplaceKeyWith: 'STRING_VALUE'
				// 		},
				// 		Condition: {
				// 			HttpErrorCodeReturnedEquals: 'STRING_VALUE',
				// 			KeyPrefixEquals: 'STRING_VALUE'
				// 		}
				// 	},
				// 	/* more items */
				// ]
			},
			// ChecksumAlgorithm: SHA256,
			ContentMD5: '',
			// ExpectedBucketOwner: 'STRING_VALUE'
		};
		s3.putBucketWebsite(webParams, function(webErr, webResults) {
			if (webErr) {
				console.log("Put Web Config Error: ", webErr, webErr.stack);
			} else {
				console.log("Web Config set: ", webResults);
				// Step 5. Get URL for accessing website on bucket
				// const getWebParams = {
				// 	Bucket: bucket, /* required */
				// 	// ExpectedBucketOwner: 'STRING_VALUE'
				// };
				// s3.getBucketWebsite(getWebParams, function(getWebErr, getWebResults) {
				// 	if (getWebErr) {
				// 		console.log("Get Web Config Error: ", getWebErr, getWebErr.stack);
				// 	} else {
				// 		console.log(`Hosting complete at: ${JSON.stringify(getWebResults)}`);
				// 		// console.log(`Hosting complete at: ${getWebResults.RedirectAllRequestsTo.Protocol}://${getWebResults.RedirectAllRequestsTo.HostName}`);
				// 	}
				// });
			}
		});
	}
	/*
		data = {
			Location: "http://examplebucket.<Region>.s3.amazonaws.com/"
		}
	*/
});