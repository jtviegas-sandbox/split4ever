#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include


__r=0

info "resetting api gateway..."

for _id in $(aws apigateway get-rest-apis --output text | grep "^ITEMS" | awk '{print $4}')
do
    debug "going to delete api $_id"
    __r=0
    aws apigateway delete-rest-api --rest-api-id $_id
    if [ ! "$__r" -eq "0" ] ; then err "could not delete api $_id" && exit 1; fi
done

info "...api gateway reset done."
