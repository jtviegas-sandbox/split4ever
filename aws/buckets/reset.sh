#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

__r=0

info "resetting buckets..."


deleteBucket $BUCKET_PARTS


info "...buckets reset done."