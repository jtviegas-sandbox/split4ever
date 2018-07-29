#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $this_folder/include

aws lambda delete-function --function-name $FUNCTION_NAME