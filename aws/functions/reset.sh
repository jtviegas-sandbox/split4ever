#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

__r=0

info "resetting tables..."


for table in $TABLES; do
    deleteTable "$table"
done


info "...tables reset done."