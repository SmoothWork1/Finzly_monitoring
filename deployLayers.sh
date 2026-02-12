#!/bin/bash

set -e

echo "STARTING"

### VARIABLES ###
CURRENT_DIR_PATH=$(pwd)
COMMON_NODE_MODULES_DIR_PATH="${CURRENT_DIR_PATH}/resources/layers/nodejs/common_node_modules/nodejs"
NODEJS_RESOURCES_DIR_PATH="${CURRENT_DIR_PATH}/resources/layers/nodejs"
STAGE="dev"

while test $# -gt 0; do
	case "$1" in
		--stage)
			shift
			STAGE=$1
			shift
			;;
	esac
done

re="^[^\W_]+_service$"
function deployservices {
	for item in `ls $1`
	do
		if [ -d $SERVICES_DIR/$item ]
		then
			if [[ "$item" =~ $re ]]
			then
				# uScoreIndex=`expr index "$item" "_"`
				# package=${item::uScoreIndex}
				package=${item%%_service*}
				# if [ $package != "security" ]
				# then
					echo "${i}. DEPLOYING ${package} SERVICE"
					((i=i+1))
					cd $SERVICES_DIR/$item
					npm i
					sls deploy --stage ${STAGE}
				# fi
			fi
		fi
	done
}

echo "1. SETTING UP NODE JS LAYER"
cd ${COMMON_NODE_MODULES_DIR_PATH}
npm install

echo "2. DEPLOYING NODE JS RESOURCES"
cd ${NODEJS_RESOURCES_DIR_PATH}
npm install
sls deploy --stage ${STAGE}


echo "FINISHED"