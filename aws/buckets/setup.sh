#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

__r=0

info "seting up buckets..."

createBucket $BUCKET_PARTS
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

info "...buckets setup done."