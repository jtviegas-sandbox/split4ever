#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

__r=0

info "resetting buckets..."


deletePolicy "$BUCKET_MAINTENANCE_POLICY_PARTS"

for bucket in $BUCKETS; do
    deleteBucket "$bucket"
done



info "...buckets reset done."