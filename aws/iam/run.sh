#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/include
_pwd=`pwd`

echo "creating iam configuration for project $PROJ..."

   #"arn:aws:s3:::*/*", "arn:aws:s3:::store_prod.split4ever.com" , "arn:aws:s3:::store_dev.split4ever.com"
   #sed  "s/.*\"Resource\": \[ XXXYYYZZZ \].*/\"Resource\": \[ abc \]/" storeMaintenanceUser.json

policy=$STORE_MAINTENANCE_USER_POLICY
echo "...going to create policy $policy..."

store_buckets=""
for b in $STORE_BUCKET_NAMES; do
    store_buckets=$store_buckets",\"arn:aws:s3:::$b.$DOMAIN\""
done
store_buckets_resource="\"arn:aws:s3:::*\/*\""$store_buckets

sed  "s/.*\"Resource\": \[ XXXYYYZZZ \].*/\t\t\"Resource\": \[ $store_buckets_resource \]/" $this_folder/$policy.policy > $this_folder/$policy.json
aws iam create-policy --policy-name $policy --policy-document file://$this_folder/$policy.json
if [ ! "$?" -eq "0" ] ; then echo "!!! could not create [policy $policy] !!! ...leaving !!!" ; cd $_pwd; return -1; fi
echo "...created policy $policy..."

   #"Resource": [  "arn:aws:s3:::store_prod.split4ever.com" , "arn:aws:s3:::store_dev.split4ever.com" ]
   #"Resource": ["arn:aws:dynamodb:us-east-1:692391178777:table/parts", "arn:aws:dynamodb:us-east-1:692391178777:table/parts"]
#echo ${v:1:${#v}}

policy=$STORE_MAINTENANCE_FUNCTION_POLICY
echo "...going to create policy $policy..."
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
if [ ! "$?" -eq "0" ] ; then echo "!!! could not create [policy $policy] !!! ...leaving !!!" ; cd $_pwd; return -1; fi
echo "...created policy $policy..."
rm $this_folder/$policy.json


echo "...going to create group $STORE_MAINTENANCE_GROUP..."
aws iam create-group --group-name $STORE_MAINTENANCE_GROUP
if [ ! "$?" -eq "0" ] ; then echo "!!! could not create [group $STORE_MAINTENANCE_GROUP] !!! ...leaving !!!" ; cd $_pwd; return -1; fi
echo "...going to attach policy $STORE_MAINTENANCE_USER_POLICY to group $STORE_MAINTENANCE_GROUP..."
arn=`aws iam list-policies --output text | grep $STORE_MAINTENANCE_USER_POLICY | awk '{print $2}'`
aws iam attach-group-policy --policy-arn $arn --group-name $STORE_MAINTENANCE_GROUP
if [ ! "$?" -eq "0" ] ; then echo "!!! could not attach policy $STORE_MAINTENANCE_USER_POLICY to group $STORE_MAINTENANCE_GROUP !!! ...leaving !!!" ; cd $_pwd; return -1; fi
echo "...created group $STORE_MAINTENANCE_GROUP..."

echo "...going to create store maintenance users and add them to the group $STORE_MAINTENANCE_GROUP..."
for u in $STORE_MAINTENANCE_USERS; do
    echo "...doing user $u..."
    aws iam create-user --user-name $u
    if [ ! "$?" -eq "0" ] ; then echo "!!! could not create user $u!!! ...leaving !!!" ; cd
    aws iam add-user-to-group --user-name $u --group-name $STORE_MAINTENANCE_GROUP
    if [ ! "$?" -eq "0" ] ; then echo "!!! could not add user $u to group $STORE_MAINTENANCE_GROUP !!! ...leaving !!!" ; cd
    echo "...user $u done..."
done



echo "... iam configuration for project $PROJ done."


