#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

__r=0

info "setting up tables..."

createTable "test"
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi


info "...tables setup done."

# aws dynamodb put-item --table-name test --item '{"num":{"N": "12"}, "description":{"S": "xpt1"}, "category":{"S":"a"}}'
# aws dynamodb put-item --table-name test --item '{"num":{"N": "13"}, "description":{"S": "xpt2"}, "category":{"S":"b"}, "images":{"L":[ {"M": {"filename": {"S":"a"}, "type":{"S": "jpg"} }} ] } }'

# aws dynamodb get-item --table-name test --key '{"num":{"N":"12"}}'
# aws dynamodb get-item --table-name test --key '{"num":{"N":"12"}}' --projection-expression "description, category"

 #aws dynamodb scan --table-name test --expression-attribute-names "num >= :one" --expression-attribute-values '{":one":{"N":"12"}}' 
