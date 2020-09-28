#!/bin/sh

#this_folder=$(dirname $(readlink -f $0))
this_folder="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

__r=0

info "seting up filestore..."


createBucket $BUCKET_PARTS
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi


policy_for_buckets_update_actions=$(buildPolicy "Allow" "$POLICY_FOR_BUCKETS_UPDATE_ACTIONS" "arn:aws:s3:::parts.split4ever.com,arn:aws:s3:::parts.split4ever.com/*")
info "...creating policy: $POLICY_FOR_BUCKETS_UPDATE..."
createPolicy $POLICY_FOR_BUCKETS_UPDATE "$policy_for_buckets_update_actions"
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

info "...attaching policy $POLICY_FOR_BUCKETS_UPDATE to $GROUP_SYS..."
attachPolicyToGroup $POLICY_FOR_BUCKETS_UPDATE $GROUP_SYS
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

policy_for_buckets_update_function_actions=$(buildPolicy "Allow" "$POLICY_FOR_BUCKETS_UPDATE_FUNCTION_ACTIONS" "arn:aws:s3:::$BUCKET_PARTS")
info "...creating policy: $POLICY_FOR_BUCKETS_UPDATE_FUNCTION..."
createPolicy $POLICY_FOR_BUCKETS_UPDATE_FUNCTION "$policy_for_buckets_update_function_actions"
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

info "...attaching policy $POLICY_FOR_BUCKETS_UPDATE_FUNCTION to role $ROLE_FOR_STORE_UPDATE_FUNCTION..."
attachRoleToPolicy $ROLE_FOR_STORE_UPDATE_FUNCTION $POLICY_FOR_BUCKETS_UPDATE_FUNCTION
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi



info "...filestore setup done."
