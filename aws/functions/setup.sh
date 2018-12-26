#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

NODE_RUNTIME=nodejs8.10
FUNC_TIMEOUT=60
FUNC_MEMORY=1024
FUNC_HANDLER=index.handler
FUNCTION_PRINCIPAL=s3.amazonaws.com
FUNCTION_ACTION="lambda:InvokeFunction"

parts_update_func=s4e_parts_update_event_function
parts_update_func_permission_id=s4e001


__r=0
info "setting up functions..."

#aws events put-rule --name "partsUpdated" --event-pattern "{\"source\":[\"aws.s3\"],\"detail\":{\"state\":[\"stopped\",\"terminated\"]}}" --role-arn "arn:aws:iam::123456789012:role/MyRoleForThisRule"
createFunction $parts_update_func $UPDATE_FUNCTION_ROLE "$this_folder/$parts_update_func".zip $FUNC_HANDLER $NODE_RUNTIME $FUNC_TIMEOUT $FUNC_MEMORY
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

#aws lambda add-permission --function-name $parts_update_func --principal s3.amazonaws.com --statement-id $parts_update_func_PERMISSION_STATEMENT_ID --action "lambda:InvokeFunction" --source-arn "$BUCKET_PARTS_ARN" --source-account $OWNER_ACCOUNT
owner=`aws s3api get-bucket-acl --bucket $BUCKET_PARTS --output=text | grep OWNER | awk '{print $3}'`
echo "owner: $owner"
addPermissionToFunction $parts_update_func $FUNCTION_PRINCIPAL $parts_update_func_permission_id $FUNCTION_ACTION $BUCKET_PARTS_ARN $owner
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

info "...functions setup done."
