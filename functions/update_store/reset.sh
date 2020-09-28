#!/bin/sh

#this_folder=$(dirname $(readlink -f $0))
this_folder="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
parent_folder=$(dirname $this_folder)
grand_parent_folder=$(dirname $parent_folder)

. $grand_parent_folder/lib
. $grand_parent_folder/include

__r=0

info "resetting store update function..."

removePermissionFromFunction $FUNCTION_STORE_UPDATE $STORE_UPDATE_FUNCTION_PERMISSION_ID

deleteFunction $FUNCTION_STORE_UPDATE

info "...store update function reset done."
