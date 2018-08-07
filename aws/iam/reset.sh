#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/include
_pwd=`pwd`

echo "removing iam configuration for project $PROJ..."

echo "...going to delete store maintenance users..."
for u in $STORE_MAINTENANCE_USERS; do
    echo "...doing user $u..."
    aws iam delete-user --user-name $u
    if [ ! "$?" -eq "0" ] ; then echo "!!! could not delete user $u!!! ...leaving !!!" ; cd
    echo "...user $u done..."
done

echo "...going to delete group $STORE_MAINTENANCE_GROUP..."
aws iam delete-group --group-name $STORE_MAINTENANCE_GROUP
if [ ! "$?" -eq "0" ] ; then echo "!!! could not delete group $STORE_MAINTENANCE_GROUP !!! ...leaving !!!" ; cd $_pwd; return -1; fi
echo "...deleted group $STORE_MAINTENANCE_GROUP..."

for p in $STORE_MAINTENANCE_USER_POLICY $STORE_MAINTENANCE_FUNCTION_POLICY; do
    arn=`aws dynamodb describe-table --output text --table-name $t | grep arn.*$t | awk '{print $4}'`
    arn=`echo $arn  | sed "s/\//\\//g"`
    store_table_resources=$store_table_resources",\"$arn\""
done


echo "...iam configuration for project $PROJ was removed."
