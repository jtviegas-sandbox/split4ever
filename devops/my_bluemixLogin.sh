#!/bin/sh

folder=$(dirname $(readlink -f $0))

api=https://api.ng.bluemix.net
org=techdays
space=devel
user=joaovieg@ie.ibm.com

pswd=$DEPLOY_PASSWD
echo " loging into space: $space & organisation: $org & api: $api"

$folder/cf login -a $api -u $user -p $pswd -o $org -s "$space"



