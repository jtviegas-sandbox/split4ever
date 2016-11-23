#!/bin/sh

api=https://api.ng.bluemix.net
org=techdays
space=devel
user=joaovieg@ie.ibm.com

pswd=$DEPLOY_PASSWD
echo " loging into space: $space & organisation: $org & api: $api"

cf login -a $api -u $user -p $pswd -o $org -s "$space"



