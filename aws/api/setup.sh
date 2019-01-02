#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

role_assuming_policy_file=$parent_folder/role_assuming.policy

parts_api_read_function_actions="dynamodb:BatchGetItem,dynamodb:ConditionCheckItem,dynamodb:ListTables,dynamodb:Scan,dynamodb:ListTagsOfResource,dynamodb:Query,dynamodb:DescribeStream,dynamodb:DescribeTimeToLive,dynamodb:ListStreams,dynamodb:DescribeGlobalTableSettings,dynamodb:DescribeReservedCapacityOfferings,dynamodb:DescribeTable,dynamodb:GetShardIterator,dynamodb:DescribeGlobalTable,dynamodb:DescribeReservedCapacity,dynamodb:GetItem,dynamodb:DescribeContinuousBackups,dynamodb:DescribeBackup,dynamodb:DescribeLimits,dynamodb:GetRecords"

parts_api_read_function_role=s4e_parts_api_read_function_role
parts_api_read_function_policy=s4e_parts_api_read_function_policy

__r=0

info "building api..."

info "...creating role for parts api read function..."
createRole $parts_api_read_function_role $role_assuming_policy_file
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi


info "...creating additional policies..."

tables_arn=
for _table in $TABLES; do
    arn=`aws dynamodb describe-table --output text --table-name $_table | grep arn.*$_table | awk '{print $4}'`
    arn=`echo $arn  | sed "s/\//\\//g"`
    
    if [ -z $tables_arn ]; then
        tables_arn="$arn"
    else
        tables_arn="$tables_arn,$arn"
    fi
done

debug "...building policy $parts_api_read_function_policy..."
policy=$(buildPolicy "Allow" "$parts_api_read_function_actions" "$tables_arn")
sleep 1
info "...creating policy: $parts_api_read_function_policy..."
createPolicy $parts_api_read_function_policy "$policy"
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

info "...attaching $parts_api_read_function_role role to policy $parts_api_read_function_policy ..."
attachRoleToPolicy $parts_api_read_function_role $parts_api_read_function_policy
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

# this policy is there already created by iam scripts
info "...attaching $parts_api_read_function_role role to policy s4e_logs_policy ..."
attachRoleToPolicy $parts_api_read_function_role s4e_logs_policy
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi


info "...api build done."
