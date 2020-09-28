#!/bin/sh

#this_folder=$(dirname $(readlink -f $0))
this_folder="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include


__r=0

info "setting up base functionalities..."

info "...creating group for sys maintenance users ($GROUP_SYS)..."
createGroup $GROUP_SYS
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi


info "...creating role for update function ($ROLE_FOR_STORE_UPDATE_FUNCTION)..."
createRole $ROLE_FOR_STORE_UPDATE_FUNCTION $this_folder/$ROLE_ASSUMING_POLICY_FILENAME
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

info "...creating users..."
for u in $SYS_USERS; do
    createUser $u
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then exit 1; fi
    addUserToGroup $u $GROUP_SYS
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then exit 1; fi
done


info "...creating policies..."

logs_policy=$(buildPolicy "Allow" "$POLICY_FOR_LOGS_ACTIONS" "arn:aws:logs:*:*:*")
info "...policy: $POLICY_FOR_LOGS..."
createPolicy $POLICY_FOR_LOGS "$logs_policy"
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

parts_overall_maintenance_policy=$(buildPolicy "Allow" "$POLICY_FOR_STORE_UPDATE_ACTIONS")
info "...policy: $POLICY_FOR_STORE_UPDATE..."
createPolicy $POLICY_FOR_STORE_UPDATE "$parts_overall_maintenance_policy"
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

info "...attaching policies to group..."

info "...attaching policy $POLICY_FOR_LOGS to $GROUP_SYS..."
attachPolicyToGroup $POLICY_FOR_LOGS $GROUP_SYS
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

info "...attaching policy $POLICY_FOR_STORE_UPDATE to $GROUP_SYS..."
attachPolicyToGroup $POLICY_FOR_STORE_UPDATE $GROUP_SYS
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

info "...attaching update function role to policy $POLICY_FOR_LOGS ..."
attachRoleToPolicy $ROLE_FOR_STORE_UPDATE_FUNCTION $POLICY_FOR_LOGS
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi




info "...base functionalities setup done."