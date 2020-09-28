#!/bin/sh

#this_folder=$(dirname $(readlink -f $0))
this_folder="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
parent_folder=$(dirname $this_folder)
grand_parent_folder=$(dirname $parent_folder)

. $grand_parent_folder/lib
. $grand_parent_folder/include


info "setting up store update function..."

_pwd=`pwd`
cd $this_folder
npm install
if [ -d "$AWS_SDK_MODULE_PATH" ]; then
    rm -rf "$AWS_SDK_MODULE_PATH"
fi
rm -f "$this_folder/$FUNCTION_STORE_UPDATE".zip
zip -9 -r "$this_folder/$FUNCTION_STORE_UPDATE".zip index.js node_modules
# reinstall aws
npm install
cd $_pwd

info "...build done."

__r=0
createFunction $FUNCTION_STORE_UPDATE $ROLE_FOR_STORE_UPDATE_FUNCTION "$this_folder/$FUNCTION_STORE_UPDATE".zip $STORE_UPDATE_FUNCTION_HANDLER $STORE_UPDATE_FUNCTION_RUNTIME $STORE_UPDATE_FUNCTION_TIMEOUT $STORE_UPDATE_FUNCTION_MEMORY
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

owner=`aws s3api get-bucket-acl --bucket $BUCKET_PARTS --output=text | grep OWNER | awk '{print $3}'`
echo "owner: $owner"
addPermissionToFunction $FUNCTION_STORE_UPDATE $STORE_UPDATE_FUNCTION_PRINCIPAL $STORE_UPDATE_FUNCTION_PERMISSION_ID $STORE_UPDATE_FUNCTION_ACTION $BUCKET_PARTS_ARN $owner
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

function_arn=`aws lambda list-functions | grep $FUNCTION_STORE_UPDATE | awk '{print $4}'`
sed  "s/.*\"LambdaFunctionArn\": \"FUNCTION_ARN\".*/      \"LambdaFunctionArn\": \"$function_arn\"/g" $this_folder/notification_template.json > $this_folder/notification.json
aws s3api put-bucket-notification-configuration --bucket $BUCKET_PARTS --notification-configuration file://$this_folder/notification.json
__r=$?
if [ ! "$__r" -eq "0" ] ; then warn "could not configure bucket events" && exit 1; else info "configured bucket events" ; fi


info "...store update function setup done."
