#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/include
. $this_folder/include
. $parent_folder/lib

__r=0

info "tables creation..."

for table in $TABLES; do
    createTable "$table"
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then err "could not create table $table !...leaving." && return 1; fi
done

info "...tables creation done."

info "buckets creation..."
for bucket in $BUCKETS; do
    createBucket "$bucket"
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then err "could not create bucket $bucket !...leaving." && return 1; fi
done
info "...buckets creation done."

info "policies creation..."

createPolicyForBucket $PART_BUCKET_MAINTENANCE_POLICY $BUCKET_PART
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not create policy $PART_BUCKET_MAINTENANCE_POLICY !...leaving." && return 1; fi




createPolicyForBucketAndTable $PART_BUCKET_2_TABLE_FUNC_POLICY $BUCKET_PART $TABLE_PART
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not create policy $PART_BUCKET_2_TABLE_FUNC_POLICY !...leaving." && return 1; fi
info "...policies done."

info "groups creation..."

createGroup $GROUP_BUCKET_MAINTENANCE_PART



info "...groups done."

stat

echo "overall outcome: $__r"


