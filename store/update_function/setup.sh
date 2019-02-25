#!/bin/sh

#this_folder=$(dirname $(readlink -f $0))
this_folder="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
parent_folder=$(dirname $this_folder)
grand_parent_folder=$(dirname $parent_folder)

. $grand_parent_folder/lib
. $grand_parent_folder/include


info "building update function..."


_pwd=`pwd`
cd $this_folder
npm install
if [ -d "$AWS_SDK_MODULE_PATH" ]; then
    rm -rf "$AWS_SDK_MODULE_PATH"
fi
rm -f "$this_folder/$PARTS_UPDATE_FUNCTION".zip
zip -9 -r "$this_folder/$PARTS_UPDATE_FUNCTION".zip index.js node_modules 
# reinstall aws
npm install
cd $_pwd

info "...update function build done."

__r=0
info "setting up update function..."

#aws events put-rule --name "partsUpdated" --event-pattern "{\"source\":[\"aws.s3\"],\"detail\":{\"state\":[\"stopped\",\"terminated\"]}}" --role-arn "arn:aws:iam::123456789012:role/MyRoleForThisRule"
createFunction $PARTS_UPDATE_FUNCTION $UPDATE_FUNCTION_ROLE "$this_folder/$PARTS_UPDATE_FUNCTION".zip $UPDATE_FUNCTION_HANDLER $FUNCTION_RUNTIME $FUNCTION_TIMEOUT $FUNCTION_MEMORY
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

owner=`aws s3api get-bucket-acl --bucket $BUCKET_PARTS --output=text | grep OWNER | awk '{print $3}'`
echo "owner: $owner"
addPermissionToFunction $PARTS_UPDATE_FUNCTION $FUNCTION_PRINCIPAL $PARTS_UPDATE_FUNCTION_PERMISSION_ID $UPDATE_FUNCTION_ACTION $BUCKET_PARTS_ARN $owner
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

info "...update function setup done."
