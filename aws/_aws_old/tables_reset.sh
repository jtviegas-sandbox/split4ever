#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $this_folder/lib_include.sh

table=test
result=$(deleteTable "$table")

echo "\ntable deletion: $result\n"