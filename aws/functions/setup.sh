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

SRC_FOLDER=$this_folder/src
aws_sdk_module_path=node_modules/aws-sdk

info "building functions..."

cd $SRC_FOLDER
for f in *; do
    info "processing function $f"
    rm -f $f.zip
    _folder="$SRC_FOLDER/$f"
    
    if [ -d "$_folder" ]; then
        cd "$_folder"
        if [ -d "$_folder/$aws_sdk_module_path" ]; then
            rm -rf "$_folder/$aws_sdk_module_path"
        fi
        zip -9 -r $this_folder/$f.zip index.js node_modules 
    fi
done

cd $this_folder


info "...functions build done."

__r=0
info "setting up functions..."

#aws events put-rule --name "partsUpdated" --event-pattern "{\"source\":[\"aws.s3\"],\"detail\":{\"state\":[\"stopped\",\"terminated\"]}}" --role-arn "arn:aws:iam::123456789012:role/MyRoleForThisRule"
createFunction $parts_update_func $UPDATE_FUNCTION_ROLE "$this_folder/$parts_update_func".zip $FUNC_HANDLER $NODE_RUNTIME $FUNC_TIMEOUT $FUNC_MEMORY
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

owner=`aws s3api get-bucket-acl --bucket $BUCKET_PARTS --output=text | grep OWNER | awk '{print $3}'`
echo "owner: $owner"
addPermissionToFunction $parts_update_func $FUNCTION_PRINCIPAL $parts_update_func_permission_id $FUNCTION_ACTION $BUCKET_PARTS_ARN $owner
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

info "...functions setup done."
