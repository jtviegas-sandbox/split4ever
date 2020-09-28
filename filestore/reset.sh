#!/bin/sh

#this_folder=$(dirname $(readlink -f $0))
this_folder="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

info "resetting filestore..."

detachRoleFromPolicy $ROLE_FOR_STORE_UPDATE_FUNCTION  $POLICY_FOR_BUCKETS_UPDATE_FUNCTION
deletePolicy $POLICY_FOR_BUCKETS_UPDATE_FUNCTION
dettachPolicyFromGroup $POLICY_FOR_BUCKETS_UPDATE $GROUP_SYS

deletePolicy $POLICY_FOR_BUCKETS_UPDATE
deleteBucket $BUCKET_PARTS


info "...filestore reset done."


