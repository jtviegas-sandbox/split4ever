#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $this_folder/lib_include.sh

table=test
result=$(createTable "$table")

echo "\ntable creation: $result"
