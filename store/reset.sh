#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include


$this_folder/update_function/reset.sh

detachRoleFromPolicy $UPDATE_FUNCTION_ROLE $UPDATE_FUNCTION_TABLES_POLICY
detachRoleFromPolicy $UPDATE_FUNCTION_ROLE $UPDATE_FUNCTION_BUCKETS_POLICY


dettachPolicyFromGroup $PARTS_BUCKET_MAINTENANCE_POLICY $PARTS_MAINTENANCE_GROUP
deletePolicy $UPDATE_FUNCTION_TABLES_POLICY
deletePolicy $UPDATE_FUNCTION_BUCKETS_POLICY
deletePolicy $PARTS_BUCKET_MAINTENANCE_POLICY

info "resetting buckets..."


deleteBucket $BUCKET_PARTS


info "...buckets reset done."

info "resetting tables..."

for table in $TABLES; do
    deleteTable "$table"
done

info "...tables reset done."

