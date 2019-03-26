#!/bin/sh

#this_folder=$(dirname $(readlink -f $0))
this_folder="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

__r=0

info "setting up tables..."

for table in $TABLES; do
    createTable "$table"
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then exit 1; fi
done


info "...tables setup done."

info "seting up buckets..."

createBucket $BUCKET_PARTS
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

info "...buckets setup done."


parts_bucket_maintenance_policy=$(buildPolicy "Allow" "$PARTS_BUCKET_MAINTENANCE_ACTIONS" "arn:aws:s3:::parts.split4ever.com,arn:aws:s3:::parts.split4ever.com/*")
info "...creating policy: $PARTS_BUCKET_MAINTENANCE_POLICY..."
createPolicy $PARTS_BUCKET_MAINTENANCE_POLICY "$parts_bucket_maintenance_policy"
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

update_function_buckets_policy=$(buildPolicy "Allow" "$UPDATE_FUNCTION_BUCKETS_ACTIONS" "arn:aws:s3:::$BUCKET_PARTS")
info "...creating policy: $UPDATE_FUNCTION_BUCKETS_POLICY..."
createPolicy $UPDATE_FUNCTION_BUCKETS_POLICY "$update_function_buckets_policy"
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

tables_arn=
for _table in $TABLES; do
    arn=`aws dynamodb describe-table --output text --table-name $_table | grep arn.*$_table | awk '{print $4}'`
    arn=`echo $arn  | sed "s/\//\\//g"`
    
    if [ -z $tables_arn ]; then
        tables_arn="$arn"
    else
        tables_arn="$tables_arn,$arn"
    fi
donegit status

update_function_tables_policy=$(buildPolicy "Allow" "$UPDATE_FUNCTION_TABLES_ACTIONS" "$tables_arn")
info "...creating policy: $UPDATE_FUNCTION_TABLES_POLICY..."
createPolicy $UPDATE_FUNCTION_TABLES_POLICY "$update_function_tables_policy"
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

info "...attaching policy $PARTS_BUCKET_MAINTENANCE_POLICY to $PARTS_MAINTENANCE_GROUP..."
attachPolicyToGroup $PARTS_BUCKET_MAINTENANCE_POLICY $PARTS_MAINTENANCE_GROUP

info "...attaching update function role to policy $UPDATE_FUNCTION_BUCKETS_POLICY ..."
attachRoleToPolicy $UPDATE_FUNCTION_ROLE $UPDATE_FUNCTION_BUCKETS_POLICY
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

info "...attaching update function role to policy $UPDATE_FUNCTION_TABLES_POLICY ..."
attachRoleToPolicy $UPDATE_FUNCTION_ROLE $UPDATE_FUNCTION_TABLES_POLICY
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

__r=0
cd $this_folder/update_function
./setup.sh
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi
cd ..
function_arn=`aws lambda list-functions | grep $PARTS_UPDATE_FUNCTION | awk '{print $4}'`
sed  "s/.*\"LambdaFunctionArn\": \"FUNCTION_ARN\".*/      \"LambdaFunctionArn\": \"$function_arn\"/g" $this_folder/notification_template.json > $this_folder/notification.json
aws s3api put-bucket-notification-configuration --bucket $BUCKET_PARTS --notification-configuration file://$this_folder/notification.json



