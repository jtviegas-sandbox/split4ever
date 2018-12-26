#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

user1=tiago
user2=rocha
parts_maintenance_users="$user1 $user2"

parts_maintenance_group=s4e_parts_maintenance
update_function_role=s4e_parts_update
role_assuming_policy_file=$this_folder/role_assuming.policy

info "resetting identity and access management..."

detachRoleFromPolicy $update_function_role s4e_logs_policy
detachRoleFromPolicy $update_function_role s4e_update_function_buckets_policy
detachRoleFromPolicy $update_function_role s4e_update_function_tables_policy
dettachPolicyFromGroup s4e_logs_policy $parts_maintenance_group
dettachPolicyFromGroup s4e_parts_overall_maintenance_policy $parts_maintenance_group
dettachPolicyFromGroup s4e_parts_bucket_maintenance_policy $parts_maintenance_group
deletePolicy s4e_update_function_tables_policy
deletePolicy s4e_update_function_buckets_policy
deletePolicy s4e_parts_overall_maintenance_policy
deletePolicy s4e_parts_bucket_maintenance_policy
deletePolicy s4e_logs_policy

for u in $parts_maintenance_users; do
    removeUserFromGroup $u $parts_maintenance_group
    deleteUser $u
done

deleteRole $update_function_role

deleteGroup "$parts_maintenance_group"


info "...identity and access management reset done."