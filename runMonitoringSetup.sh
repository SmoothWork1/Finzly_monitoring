#!/bin/bash

set -e

echo "STARTING"

### VARIABLES ###
CURRENT_DIR_PATH=$(pwd)
NODE_SCRIPTS_DIR="${CURRENT_DIR_PATH}/resources/scripts"

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

cd ${NODE_SCRIPTS_DIR}
echo "1.1. DEPLOYING MONITORING DATABASE"
#node deployDB.js

echo "1.2. DEPLOYING MONITORING TABLES"
#node createTables.js

echo "2. SETUP MONITORING COGNITO"
node setupCognito.js

echo "IMP: Please make sure to copy the coginito userpool and identity pool information to ui/monitoring_service/env.dev file"

echo "FINISHED"

echo 'NOTE: If you want to rollback the coginito, Please sure to do following.'
echo "1. Remove Identity Pool"
echo "2. Remove UserPool"
echo "3. Remove galaxy-monitoring-admin-dev-policy  IAM policy"
echo "4. Remove galaxy-monitoring-admin-dev-auth-role IAM Role"
echo "5. Remove galaxy-monitoring-admin-dev-unauth-role IAM Role"
echo "6. Remove monitoring_service"
echo "7. Remove monitoring_service/security"
echo "8. Remove s3 bucket"
echo "9. Remove route53 hosted zone"
echo "10. Remove cloundfront distribution"