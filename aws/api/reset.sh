#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

parts_api_read_function_role=s4e_parts_api_read_function_role
parts_api_read_function_policy_name=s4e_parts_api_read_function_policy
parts_api_logging_policy=s4e_logging_policy

__r=0

info "resetting api..."

deleteStack $API_STACK
deleteBucket $BUCKET_FUNCTIONS
detachRoleFromPolicy $parts_api_read_function_role $parts_api_logging_policy
detachRoleFromPolicy $parts_api_read_function_role $parts_api_read_function_policy_name
deletePolicy $parts_api_read_function_policy_name
deletePolicy $parts_api_logging_policy
deleteRole $parts_api_read_function_role

info "...api reset done."
