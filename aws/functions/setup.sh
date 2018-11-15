#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

__r=0
info "setting up functions..."

#aws events put-rule --name "partsUpdated" --event-pattern "{\"source\":[\"aws.s3\"],\"detail\":{\"state\":[\"stopped\",\"terminated\"]}}" --role-arn "arn:aws:iam::123456789012:role/MyRoleForThisRule"
createFunction $PARTS_UPDATE_FUNCTION $DATA_MAINTENANCE_FUNCTION_ROLE $PARTS_UPDATE_FUNCTION_ZIP $PARTS_UPDATE_FUNCTION_HANDLER $NODE_RUNTIME $PARTS_UPDATE_FUNCTION_TIMEOUT $PARTS_UPDATE_FUNCTION_MEMORY
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

#aws lambda add-permission --function-name $PARTS_UPDATE_FUNCTION --principal s3.amazonaws.com --statement-id $PARTS_UPDATE_FUNCTION_PERMISSION_STATEMENT_ID --action "lambda:InvokeFunction" --source-arn "$BUCKET_PARTS_ARN" --source-account $OWNER_ACCOUNT
addPermissionToFunction $PARTS_UPDATE_FUNCTION $PARTS_UPDATE_FUNCTION_PRINCIPAL $PARTS_UPDATE_FUNCTION_PERMISSION_STATEMENT_ID $PARTS_UPDATE_FUNCTION_ACTION $BUCKET_PARTS_ARN $OWNER_ACCOUNT
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

info "...functions setup done."
