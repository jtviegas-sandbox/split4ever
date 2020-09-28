#!/bin/sh

#this_folder=$(dirname $(readlink -f $0))
this_folder="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

info "resetting datastore..."

detachRoleFromPolicy $ROLE_FOR_STORE_UPDATE_FUNCTION $POLICY_FOR_TABLES_UPDATE
deletePolicy $POLICY_FOR_TABLES_UPDATE

for table in $TABLES; do
    deleteTable "$table"
done

info "...datastore reset done."

