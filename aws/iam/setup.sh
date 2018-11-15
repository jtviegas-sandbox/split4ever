#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

__r=0

info "setting up identity and access management..."

info "...creating group for data maintenance users..."
createGroup $DATA_MAINTENANCE_GROUP
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

info "...policy for parts bucket maintenance (for user access)..."
createPolicyForBucket $BUCKET_MAINTENANCE_POLICY_PARTS $BUCKET_PARTS
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

info "...attaching the policy for parts bucket maintenance (for user access) to the data maintenance users group..."
attachPolicyToGroup $BUCKET_MAINTENANCE_POLICY_PARTS $DATA_MAINTENANCE_GROUP

info "...policy for accessing both parts table and bucket (for programmatical access)..."
createPolicyForBucketAndTable $BUCKET_TO_TABLE_FUNCTION_POLICY_PARTS $BUCKET_PARTS $TABLE_PARTS
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

for u in $DATA_MAINTENANCE_USERS; do
    createUser $u
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then return 1; fi
    addUserToGroup $u $DATA_MAINTENANCE_GROUP
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then return 1; fi
done

<<<<<<< HEAD
info "...creating role for data maintenance function..."
createRole $DATA_MAINTENANCE_FUNCTION_ROLE $this_folder/$ROLE_ASSUMING_POLICY_FILE
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

info "...attaching data maintenance function role to policy for accessing both parts table and bucket ..."
attachRoleToPolicy $DATA_MAINTENANCE_FUNCTION_ROLE $BUCKET_TO_TABLE_FUNCTION_POLICY_PARTS
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi



=======
>>>>>>> e4e68d88d4a6b857aac334e16b66e70f4f7886b9




info "...identity and access management setup done."