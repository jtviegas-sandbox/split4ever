#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/include
. $parent_folder/include_lib

info "tables creation..."

for table in $STORE_TABLES; do
    createTable "$table"
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then err "could not create table $table !...leaving." && return 1; fi
done

info "...tables creation done."

info "buckets creation..."
for bucket in $STORE_BUCKETS; do
    createBucket "$bucket"
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then err "could not create bucket $bucket !...leaving." && return 1; fi
done
info "...buckets creation done."



echo "overall outcome: $__r"


