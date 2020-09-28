#!/bin/sh

#this_folder=$(dirname $(readlink -f $0))
this_folder="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include



info "resetting base functionalities..."

detachRoleFromPolicy $ROLE_FOR_STORE_UPDATE_FUNCTION $POLICY_FOR_LOGS
dettachPolicyFromGroup $POLICY_FOR_STORE_UPDATE $GROUP_SYS
dettachPolicyFromGroup $POLICY_FOR_LOGS $GROUP_SYS
deletePolicy $POLICY_FOR_STORE_UPDATE
deletePolicy $POLICY_FOR_LOGS

for u in $SYS_USERS; do
    removeUserFromGroup $u $GROUP_SYS
    deleteUser $u
done

deleteRole $ROLE_FOR_STORE_UPDATE_FUNCTION
deleteGroup "$GROUP_SYS"











info "...base functionalities reset done."