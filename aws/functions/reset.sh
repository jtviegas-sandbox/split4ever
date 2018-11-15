#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

__r=0

info "functions tables..."

removePermissionFromFunction $PARTS_UPDATE_FUNCTION $PARTS_UPDATE_FUNCTION_PERMISSION_STATEMENT_ID

deleteFunction $PARTS_UPDATE_FUNCTION

info "...functions reset done."
