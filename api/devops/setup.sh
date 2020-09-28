#!/bin/sh
this_folder="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

role_assuming_policy_file=$parent_folder/common/role_assuming.policy

parts_api_read_function_actions="dynamodb:BatchGetItem,dynamodb:ConditionCheckItem,dynamodb:ListTables,dynamodb:Scan,dynamodb:ListTagsOfResource,dynamodb:Query,dynamodb:DescribeStream,dynamodb:DescribeTimeToLive,dynamodb:ListStreams,dynamodb:DescribeGlobalTableSettings,dynamodb:DescribeReservedCapacityOfferings,dynamodb:DescribeTable,dynamodb:GetShardIterator,dynamodb:DescribeGlobalTable,dynamodb:DescribeReservedCapacity,dynamodb:GetItem,dynamodb:DescribeContinuousBackups,dynamodb:DescribeBackup,dynamodb:DescribeLimits,dynamodb:GetRecords"
logging_policy_actions="logs:*"

parts_api_read_function_role=s4e_parts_api_read_function_role
parts_api_read_function_policy=s4e_parts_api_read_function_policy
parts_api_logging_policy=s4e_logging_policy

_pwd=`pwd`
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

logging_policy=$(buildPolicy "Allow" "$logging_policy_actions" "arn:aws:logs:*:*:*")
info "...creating policy: $parts_api_logging_policy..."
createPolicy $parts_api_logging_policy "$logging_policy"
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

info "...attaching $parts_api_read_function_role role to policy $parts_api_read_function_policy ..."
attachRoleToPolicy $parts_api_read_function_role $parts_api_read_function_policy
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi
    

info "...attaching $parts_api_read_function_role role to policy $parts_api_logging_policy ..."
attachRoleToPolicy $parts_api_read_function_role $parts_api_logging_policy
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

cd $this_folder/src


arn=`aws iam list-roles --output text | grep $parts_api_read_function_role | awk '{print $2}'`
sed  "s=.*Role: \[ ROLE_ARN \].*=      Role: $arn=" $this_folder/template.yaml > $this_folder/src/template.yaml
# sed  "s=.*Value: \[ ROLE_ARN \].*=      Value: $arn=" $this_folder/src/temp.yaml > $this_folder/src/template.yaml
# rm $this_folder/src/temp.yaml

info "...building src..."
sam build --use-container
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not build src" && return 1; fi

info "...create and deploy built src to functions bucket..."
createBucket $BUCKET_FUNCTIONS
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not create bucket" && return 1; fi


info "...packaging api..."

rm -f $this_folder/src/packaged.yaml
sam package --output-template-file $this_folder/src/packaged.yaml --s3-bucket $BUCKET_FUNCTIONS
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not package the api" && return 1; fi

info "...deploying api..."
sam deploy --template-file packaged.yaml --stack-name $API_STACK --capabilities CAPABILITY_IAM --region $REGION
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not deploy the api" && return 1; fi

# get API endpoint
API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name $API_STACK --query 'Stacks[0].Outputs[0].OutputValue')
# remove quotes
API_ENDPOINT=$(sed -e 's/^"//' -e 's/"$//' <<< $API_ENDPOINT)
echo "api: $API_ENDPOINT"

cd $_pwd

echo "$API_ENDPOINT" > $this_folder/$API_URL_FILE


info "...api build done."
