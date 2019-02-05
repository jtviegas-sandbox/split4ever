#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include



info "resetting common functionalities..."

detachRoleFromPolicy $UPDATE_FUNCTION_ROLE $LOGS_POLICY
dettachPolicyFromGroup $PARTS_OVERALL_MAINTENANCE_POLICY $PARTS_MAINTENANCE_GROUP
dettachPolicyFromGroup $LOGS_POLICY $PARTS_MAINTENANCE_GROUP
deletePolicy $PARTS_OVERALL_MAINTENANCE_POLICY
deletePolicy $LOGS_POLICY

for u in $PARTS_MAINTENANCE_USERS; do
    removeUserFromGroup $u $PARTS_MAINTENANCE_GROUP
    deleteUser $u
done

deleteRole $UPDATE_FUNCTION_ROLE
deleteGroup "$PARTS_MAINTENANCE_GROUP"











info "...common functionalities reset done."