#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

parts_endpoint=parts
api_collection_parts=$parts_endpoint
api_singular="{id}"

__r=0

info "building api gateway..."

_api_id=`aws apigateway create-rest-api --name $parts_endpoint --output text | grep "^HEADER" | awk '{print $3}'`
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not create api gw" && exit 1; fi
debug "_api_id: $_api_id"

_api_root_id=`aws apigateway get-resources --rest-api-id $_api_id | grep "/$" | awk '{print $2}'`
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not get resources from api id $_api_id" && exit 1; fi
debug "_api_root_id: $_api_root_id"

_api_collection_parts_id=`aws apigateway create-resource --rest-api-id $_api_id  --parent-id $_api_root_id  --path-part $api_collection_parts | awk '{print $1}'`
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not create the parts collection endpoint" && exit 1; fi
debug "_api_collection_parts_id: $_api_collection_parts_id"

_api_singular_parts_id=`aws apigateway create-resource --rest-api-id $_api_id  --parent-id $_api_collection_parts_id  --path-part $api_singular | awk '{print $1}'`
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not create the parts singular endpoint" && exit 1; fi
debug "_api_singular_parts_id: $_api_singular_parts_id"

aws apigateway put-method --rest-api-id $_api_id --resource-id $_api_collection_parts_id --http-method GET --authorization-type "NONE"
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not add GET method to parts collection endpoint" && exit 1; fi

aws apigateway put-method --rest-api-id $_api_id --resource-id $_api_singular_parts_id --http-method GET --authorization-type "NONE" --request-parameters method.request.path.id=true
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not add GET method to parts singular endpoint" && exit 1; fi

info "...api gateway build done."
