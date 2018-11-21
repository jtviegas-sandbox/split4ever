#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

__r=0

info "seting up buckets..."

for bucket in $BUCKETS; do
    createBucket "$bucket"
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then exit 1; fi
done

info "...buckets setup done."