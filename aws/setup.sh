#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. ./include
_pwd=`pwd`

echo "#################################################\n#################################################\n#################################################"
echo "-------\ncreating aws config for project $PROJ...\n-------"

echo "------- creating tables for project $PROJ..."

createTable()
{
    table=$1   
    aws dynamodb list-tables --output text | grep $table
    if [ "$?" -eq "0" ]
    then
        echo "------- ...table $table was already created"
    else
        aws dynamodb create-table --table-name $table --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
        if [ ! "$?" -eq "0" ] ; then echo "------- ! could not create table $table !...leaving." && cd $_pwd && return 1; else echo "------- created table $table" ; fi
    fi
}

for t in $TABLES; do
    createTable "$t" 
done

echo "------- ... tables for project $PROJ done."


echo "------- creating buckets for project $PROJ..."

createBucket()
{
    BUCKET_NAME="$1.$DOMAIN"
    BUCKET="s3://$BUCKET_NAME"
    aws s3 ls | grep $BUCKET_NAME
    if [ "$?" -eq "0" ]
    then
        echo "------- ...found bucket $BUCKET already created..."
    else
        aws s3 mb $BUCKET
        if [ ! "$?" -eq "0" ] ; then echo "------- ! could not create bucket $BUCKET !...leaving." && cd $_pwd && return 1; else echo "------- created bucket $BUCKET" ; fi
    fi
}

for b in $BUCKET_NAMES; do
   createBucket "$b" 
done

echo "------- ... creating buckets for project $PROJ done."


echo "------- creating iam configuration for project $PROJ..."toto

policy=$STORE_MAINTENANCE_USER_POLICY
store_buckets=""
for b in $STORE_BUCKET_NAMES; do
    store_buckets=$store_buckets",\"arn:aws:s3:::$b.$DOMAIN\""
done
store_buckets_resource="\"arn:aws:s3:::*\/*\""$store_buckets

sed  "s/.*\"Resource\": \[ XXXYYYZZZ \].*/\t\t\"Resource\": \[ $store_buckets_resource \]/" $this_folder/$policy.policy > $this_folder/$policy.json
aws iam create-policy --policy-name $policy --policy-document file://$this_folder/$policy.json
if [ ! "$?" -eq "0" ] ; then echo "------- ! could not create policy $policy !...leaving." && cd $_pwd && return 1; else echo "------- created policy $policy" ; fi
rm $this_folder/$policy.json

policy=$STORE_MAINTENANCE_FUNCTION_POLICY
store_buckets_resource=`echo -n $store_buckets | tail -c +2`
sed  "s/.*\"Resource\": \[ XXXXXX \].*/\t\t\"Resource\": \[ $store_buckets_resource \]/" $this_folder/$policy.policy > $this_folder/$policy.2
store_table_resources=""
for t in $TABLES; do
    arn=`aws dynamodb describe-table --output text --table-name $t | grep arn.*$t | awk '{print $4}'`
    arn=`echo $arn  | sed "s/\//\\//g"`
    store_table_resources=$store_table_resources",\"$arn\""
done
store_table_resources=`echo -n $store_table_resources | tail -c +2`
sed  "s=.*\"Resource\": \[ YYYYYY \].*=\t\t\"Resource\": \[ $store_table_resources \]=" $this_folder/$policy.2 > $this_folder/$policy.json
rm $this_folder/$policy.2

aws iam create-policy --policy-name $policy --policy-document file://$this_folder/$policy.json
if [ ! "$?" -eq "0" ] ; then echo "------- ! could not create policy $policy !...leaving." && cd $_pwd && return 1; else echo "------- created policy $policy" ; fi
rm $this_folder/$policy.json

aws iam create-group --group-name $STORE_MAINTENANCE_GROUP
if [ ! "$?" -eq "0" ] ; then echo "------- ! could not create group $STORE_MAINTENANCE_GROUP !...leaving." && cd $_pwd && return 1; else echo "------- created group $STORE_MAINTENANCE_GROUP" ; fi
arn=`aws iam list-policies --output text | grep $STORE_MAINTENANCE_USER_POLICY | awk '{print $2}'`
aws iam attach-group-policy --policy-arn $arn --group-name $STORE_MAINTENANCE_GROUP
if [ ! "$?" -eq "0" ] ; then echo "------- ! could not attach policy $STORE_MAINTENANCE_USER_POLICY to group $STORE_MAINTENANCE_GROUP !...leaving." && cd $_pwd && return 1; else echo "------- attached policy $STORE_MAINTENANCE_USER_POLICY to group $STORE_MAINTENANCE_GROUP" ; fi

for u in $STORE_MAINTENANCE_USERS; do
    aws iam create-user --user-name $u
    if [ ! "$?" -eq "0" ] ; then echo "------- ! could not create user $u !...leaving." && cd $_pwd && return 1; else echo "------- created user $u" ; fi
    aws iam add-user-to-group --user-name $u --group-name $STORE_MAINTENANCE_GROUP
    if [ ! "$?" -eq "0" ] ; then echo "------- ! could not add user $u to group $STORE_MAINTENANCE_GROUP !...leaving." && cd $_pwd && return 1; else echo "------- added user $u to group $STORE_MAINTENANCE_GROUP" ; fi
done



echo "------- ... iam configuration for project $PROJ done."


echo "------- creating functions for project $PROJ..."

zip -9 $this_folder/$FUNCTIONS_ZIP $this_folder/$FUNCTIONS_SCRIPT
if [ ! "$?" -eq "0" ] ; then echo "------- ! could not create $FUNCTIONS_ZIP !...leaving." && cd $_pwd && return 1; fi
template="sam-template.yaml"
BUCKET=s3://$BUCKET_FUNCTION/
aws s3 cp $this_folder/$FUNCTIONS_ZIP $BUCKET
if [ ! "$?" -eq "0" ] ; then echo "------- ! could not copy $FUNCTIONS_ZIP to $BUCKET !...leaving." && cd $_pwd && return 1; fi
template="sam-template.yaml"

aws iam create-role --role-name $STORE_MAINTENANCE_FUNCTION_ROLE --assume-role-policy-document file://$this_folder/$ASSUME_ROLE_POLICY_FILE
if [ ! "$?" -eq "0" ] ; then echo "------- ! could not create role $STORE_MAINTENANCE_FUNCTION_ROLE !...leaving." && cd $_pwd && return 1; fi
arn=`aws iam list-policies --output text | grep $STORE_MAINTENANCE_FUNCTION_POLICY | awk '{print $2}'`
aws iam attach-role-policy --policy-arn $arn --role-name $STORE_MAINTENANCE_FUNCTION_ROLE
if [ ! "$?" -eq "0" ] ; then echo "------- ! could attach policy $STORE_MAINTENANCE_FUNCTION_POLICY to role $STORE_MAINTENANCE_FUNCTION_ROLE !...leaving." && cd $_pwd && return 1; fi
arn=`aws iam list-roles --output text | grep $STORE_MAINTENANCE_FUNCTION_ROLE | awk '{print $2}'`
aws lambda create-function --function-name $LOAD_FUNCTION --runtime $FUNCTION_RUNTIME --role $arn --handler $LOAD_FUNCTION_HANDLER --code $LOAD_FUNCTION_CODE --timeout $LOAD_FUNCTION_TIMEOUT --memory-size $LOAD_FUNCTION_MEMORY --tags project=split4ever,stack=prod
if [ ! "$?" -eq "0" ] ; then echo "------- ! could not create function $LOAD_FUNCTION !...leaving." && cd $_pwd && return 1; else echo "------- created function $LOAD_FUNCTION" ; fi

# sed  "s=.*Role: 'XXXXXXROLE01XXXXX'.*=      Role: '$arn'=" $this_folder/$SAM_TEMPLATE > $this_folder/$TEMPLATE
# aws cloudformation deploy --template-file $this_folder/$TEMPLATE --capabilities $CAPABILITY --stack-name PROD
# if [ ! "$?" -eq "0" ] ; then echo "------- ! could not create functions !...leaving." && cd $_pwd && return 1; else echo "------- created functions" ; fi

echo "------- creating functions for project $PROJ done."

echo "-------\naws config for project $PROJ done.\n-------"

# aws iam list-roles --output text | grep storeMaintenanceFunction | awk '{print $2}'
# arn:aws:iam::692391178777:role/storeMaintenanceFunction
# sed  "s=.*Role: 'XXXXXXROLE01XXXXX'.*=      Role: 'arn:aws:iam::692391178777:role/storeMaintenanceFunction'=" sam-template.yaml > template.yaml
# aws cloudformation deploy --template-file template.yaml --capabilities CAPABILITY_IAM --stack-name PROD
