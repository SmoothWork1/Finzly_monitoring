#!/bin/bash

set -e

echo "STARTING"
echo "IMP: Please make sure to copy the coginito userpool and identity pool information to ui/monitoring_service/env.dev file"

### VARIABLES ###
CURRENT_DIR_PATH=$(pwd)
MONITORING_SERVICE_DIR="${CURRENT_DIR_PATH}/services/nodejs/monitoring_service"
UI_DIR="${CURRENT_DIR_PATH}/ui"
MONITORING_UI_DIR="${CURRENT_DIR_PATH}/ui/monitoring-service"
STAGE="prod"
REGION="us-east-2"
UI_BUCKET="monitoring.finzly.io"

while test $# -gt 0; do
	case "$1" in
		--stage)
			shift
			STAGE=$1
			shift
			;;
		--region)
			shift
			REGION=$1
			shift
			;;
		--ui-bucket)
			shift
			UI_BUCKET=$1
			shift
			;;
	esac
done

cd ${MONITORING_SERVICE_DIR}
npm i
echo "1. DEPLOYING MONITORING AUTHORIZER"
#cd security
#sls deploy --stage ${STAGE}
cd ..

echo "2. DEPLOYING MONITORING SERVICE"
#sls deploy --stage ${STAGE}

echo "3. DEPLOYING MONITORING UI"
cd ${MONITORING_UI_DIR}
npm i
npm run build-${STAGE}
cd ${UI_DIR}
npm i
node deployS3MonitoringWeb.js ${REGION} ${UI_BUCKET}

echo "FINISHED"

echo "How to setup https"
echo "1. Setup S3 Static Website (http)"
echo "2. Create Cloudfront distribution"
echo "3. NOTE. Make sure Origin Domain Id/Name, is like <bucket-name>.s3-website.<region>.amazonaws.com"
echo "4. Setup Route53 Hosted zone with cloudfront distribution"