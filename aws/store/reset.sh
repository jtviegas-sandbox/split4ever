#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/include
. $parent_folder/include_lib

for table in $TABLES; do
    deleteTable "$table"
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then err "could not delete table $table !...leaving."; fi
done

for bucket in $BUCKETS; do
    deleteBucket "$bucket"
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then err "could not create bucket $bucket !...leaving."; fi
done

echo "overall outcome: $__r"

