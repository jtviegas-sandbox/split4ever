#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/include
_pwd=`pwd`

echo "removing iam configuration for project $PROJ..."


for u in $STORE_MAINTENANCE_USERS; do
    aws iam remove-user-from-group --user-name $u --group-name $STORE_MAINTENANCE_GROUP
    #if [ ! "$?" -eq "0" ] ; then echo "! could not remove user $u from group $STORE_MAINTENANCE_GROUP !...leaving." && cd $_pwd && return 1; else echo "removed user $u from group $STORE_MAINTENANCE_GROUP" ; fi
    if [ ! "$?" -eq "0" ] ; then echo "! could not remove user $u from group $STORE_MAINTENANCE_GROUP !"; else echo "removed user $u from group $STORE_MAINTENANCE_GROUP" ; fi
    aws iam delete-user --user-name $u
    #if [ ! "$?" -eq "0" ] ; then echo "! could not delete user $u !...leaving." && cd $_pwd && return 1; else echo "deleted user $u" ; fi
    if [ ! "$?" -eq "0" ] ; then echo "! could not delete user $u !" ; else echo "deleted user $u" ; fi
done


arn=`aws iam list-policies --output text | grep $STORE_MAINTENANCE_USER_POLICY | awk '{print $2}'`
aws iam detach-group-policy --group-name $STORE_MAINTENANCE_GROUP --policy-arn $arn
#if [ ! "$?" -eq "0" ] ; then echo "! could not detach policy $STORE_MAINTENANCE_USER_POLICY from group $STORE_MAINTENANCE_GROUP !...leaving." && cd $_pwd && return 1; else echo "detached policy $STORE_MAINTENANCE_USER_POLICY from group $STORE_MAINTENANCE_GROUP" ; fi
if [ ! "$?" -eq "0" ] ; then echo "! could not detach policy $STORE_MAINTENANCE_USER_POLICY from group $STORE_MAINTENANCE_GROUP !" ; else echo "detached policy $STORE_MAINTENANCE_USER_POLICY from group $STORE_MAINTENANCE_GROUP" ; fi
aws iam delete-group --group-name $STORE_MAINTENANCE_GROUP
#if [ ! "$?" -eq "0" ] ; then echo "! could not delete group $STORE_MAINTENANCE_GROUP !...leaving." && cd $_pwd && return 1; else echo "deleted group $STORE_MAINTENANCE_GROUP" ; fi
if [ ! "$?" -eq "0" ] ; then echo "! could not delete group $STORE_MAINTENANCE_GROUP !" ; else echo "deleted group $STORE_MAINTENANCE_GROUP" ; fi

for p in $POLICIES; do
    arn=`aws iam list-policies --output text | grep $p | awk '{print $2}'`
    for v in `aws iam list-policy-versions --policy-arn $arn --output text | awk '{print $4}'`; do
        aws iam delete-policy-version --policy-arn $arn --version-id $v
        #if [ ! "$?" -eq "0" ] ; then echo "! could not delete policy $p version $v !...leaving." && cd $_pwd && return 1; else echo "deleted policy $p version $v" ; fi
        if [ ! "$?" -eq "0" ] ; then echo "! could not delete policy $p version $v !"; else echo "deleted policy $p version $v" ; fi
    done
    aws iam delete-policy --policy-arn $arn
    #if [ ! "$?" -eq "0" ] ; then echo "! could not delete policy $p !...leaving." && cd $_pwd && return 1; else echo "deleted policy $p" ; fi
    if [ ! "$?" -eq "0" ] ; then echo "! could not delete policy $p !"; else echo "deleted policy $p" ; fi
done

echo "...iam configuration for project $PROJ was removed."
