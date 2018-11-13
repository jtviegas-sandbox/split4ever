#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

__r=0

info "setting up functions..."

createPolicyForBucketAndTable $BUCKET_TO_TABLE_FUNCTION_POLICY_PARTS $BUCKET_PARTS $TABLE_PARTS
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi


info "...functions setup done."