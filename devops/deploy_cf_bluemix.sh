#!/bin/sh

devops=$(dirname $(readlink -f $0))
#devops=$(dirname $folder)
base=$(dirname $devops)

. $devops/VARS.sh

_pwd=`pwd`

cd $base/dist

APP_NAME=split4ever

cf delete --f --r $APP_NAME
sleep 16 
cf push $APP_NAME --no-start
#cf set-env $APP_NAME MONGO_IP $MONGO_IP
cf start $APP_NAME

sleep 16 
cf logs $APP_NAME --recent

cd $_pwd
