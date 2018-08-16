#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/include
. $parent_folder/include_lib

table=$STORE_TABLE
createTable "$table"
__r=$?
if [ ! "$__r" -eq "0" ] ; then echo "------- ! could not create table $table !...leaving." && cd $_pwd && return 1; else echo "------- created table $table" ; fi
