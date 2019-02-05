#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include


parts_update_func=s4e_parts_update_event_function
parts_update_func_permission_id=s4e001

__r=0

info "resetting functions..."

removePermissionFromFunction $parts_update_func $parts_update_func_permission_id

deleteFunction $parts_update_func

info "...functions reset done."
