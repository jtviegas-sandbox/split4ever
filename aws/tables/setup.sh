#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

__r=0

info "setting up tables..."

for table in $TABLES; do
    createTable "$table"
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then return 1; fi
done


info "...tables setup done."