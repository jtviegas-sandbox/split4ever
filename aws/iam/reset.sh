#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

__r=0

info "resetting identity and access management..."

detachRoleFromPolicy $DATA_MAINTENANCE_FUNCTION_ROLE $BUCKET_TO_TABLE_FUNCTION_POLICY_PARTS

deleteRole $DATA_MAINTENANCE_FUNCTION_ROLE

for u in $DATA_MAINTENANCE_USERS; do
    removeUserFromGroup $u $DATA_MAINTENANCE_GROUP
    deleteUser $u
done

deletePolicy "$BUCKET_TO_TABLE_FUNCTION_POLICY_PARTS"

dettachPolicyFromGroup $BUCKET_MAINTENANCE_POLICY_PARTS $DATA_MAINTENANCE_GROUP

deletePolicy "$BUCKET_MAINTENANCE_POLICY_PARTS"

deletePolicy "$BUCKET_PUBLIC_READ_POLICY"

deleteGroup "$DATA_MAINTENANCE_GROUP"

info "...identity and access management reset done."