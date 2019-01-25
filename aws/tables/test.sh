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

aws dynamodb create-table --table-name test --endpoint-url http://localhost:8000 --attribute-definitions '[{"AttributeName":"id","AttributeType":"S"},{"AttributeName":"num","AttributeType":"N"}]' --key-schema '[{"AttributeName":"id","KeyType":"HASH"},{"AttributeName":"num","KeyType":"RANGE"}]'  --provisioned-throughput '{"ReadCapacityUnits":5, "WriteCapacityUnits":5}'

aws dynamodb put-item --table-name test --endpoint-url http://localhost:8000 --item '{"id":{"S":"xpto1"} ,"num":{"N": "12"}, "description":{"S": "xpt1"}, "category":{"S":"a"}}'

aws dynamodb put-item --table-name test --endpoint-url http://localhost:8000  --item '{"id":{"S":"xpto2"}, "num":{"N": "13"}, "description":{"S": "xpt2"}, "category":{"S":"b"}, "images":{"L":[ {"M": {"filename": {"S":"a"}, "type":{"S": "jpg"} }} ] } }'

aws dynamodb query --table-name test --endpoint-url http://localhost:8000  --key-condition-expression "id=:id and num=:num" --expression-attribute-values '{":num":{"N":"12"}, ":id":{"S":"xpto1"}}'

aws dynamodb scan --table-name test --endpoint-url http://localhost:8000  --expression-attribute-values '{":num":{"N":"11"}, ":id":{"S":"xpto1"}}' --filter-expression "num>=:num and id=:id " 

aws dynamodb scan --table-name test --endpoint-url http://localhost:8000 

aws dynamodb scan --table-name test --endpoint-url http://localhost:8000  --max-items 1




# aws dynamodb get-item --table-name test --key '{"num":{"N":"12"}}'
# aws dynamodb get-item --table-name test --key '{"num":{"N":"12"}}' --projection-expression "description, category"

 #aws dynamodb scan --table-name test --expression-attribute-names "num >= :one" --expression-attribute-values '{":one":{"N":"12"}}' 
