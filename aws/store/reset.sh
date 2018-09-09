#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/include
. $parent_folder/include_lib


for policy in $POLICY_BUCKET_ARRAY_PART; do
    deletePolicy "$policy"
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then err "could not delete policy $policy !"; fi
done


for bucket in $BUCKETS; do
    deleteBucket "$bucket"
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then err "could not create bucket $bucket !"; fi
done



for table in $TABLES; do
    deleteTable "$table"
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then err "could not delete table $table !"; fi
done





echo "overall outcome: $__r"

