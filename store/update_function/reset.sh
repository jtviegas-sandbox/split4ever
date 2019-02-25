#!/bin/sh

#this_folder=$(dirname $(readlink -f $0))
this_folder="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
parent_folder=$(dirname $this_folder)
grand_parent_folder=$(dirname $parent_folder)

. $grand_parent_folder/lib
. $grand_parent_folder/include


parts_update_func=s4e_parts_update_event_function
parts_update_func_permission_id=s4e001

__r=0

info "resetting update function..."

removePermissionFromFunction $PARTS_UPDATE_FUNCTION $PARTS_UPDATE_FUNCTION_PERMISSION_ID

deleteFunction $PARTS_UPDATE_FUNCTION

info "...update function reset done."
