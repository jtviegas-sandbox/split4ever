#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/include
. $parent_folder/include_lib

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

createPolicyForBucket $POLICY_BUCKET_PART_MAINTENANCE $BUCKET_PART
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not create policy $POLICY_BUCKET_PART_MAINTENANCE !...leaving." && return 1; fi
createPolicyForFunction $POLICY_FUNCTION_PART_MAINTENANCE $BUCKET_PART $TABLE_PART
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not create policy $POLICY_BUCKET_PART_MAINTENANCE !...leaving." && return 1; fi
info "...policies done."






echo "overall outcome: $__r"


