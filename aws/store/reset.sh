#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/include
. $parent_folder/include_lib

table=$STORE_TABLE
deleteTable "$table"
__r=$?
if [ ! "$__r" -eq "0" ] ; then echo "------- ! could not delete table $table !...leaving."; fi
