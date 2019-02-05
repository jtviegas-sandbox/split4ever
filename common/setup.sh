#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include


__r=0

info "setting up common functionalities..."

info "...creating group for data maintenance users..."
createGroup $PARTS_MAINTENANCE_GROUP
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi


info "...creating role for update function..."
createRole $UPDATE_FUNCTION_ROLE $this_folder/$ROLE_ASSUMING_POLICY_FILENAME
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

info "...creating users..."
for u in $PARTS_MAINTENANCE_USERS; do
    createUser $u
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then return 1; fi
    addUserToGroup $u $PARTS_MAINTENANCE_GROUP
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then exit 1; fi
done


info "...creating policies..."

logs_policy=$(buildPolicy "Allow" "$LOGS_POLICY_ACTIONS" "arn:aws:logs:*:*:*")
info "...policy: $LOGS_POLICY..."
createPolicy $LOGS_POLICY "$logs_policy"
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

parts_overall_maintenance_policy=$(buildPolicy "Allow" "$PARTS_OVERALL_MAINTENANCE_ACTIONS")
info "...policy: $PARTS_OVERALL_MAINTENANCE_POLICY..."
createPolicy $PARTS_OVERALL_MAINTENANCE_POLICY "$parts_overall_maintenance_policy"
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi


info "...attaching policies to group..."

info "...attaching policy $LOGS_POLICY to $PARTS_MAINTENANCE_GROUP..."
attachPolicyToGroup $LOGS_POLICY $PARTS_MAINTENANCE_GROUP

info "...attaching policy $PARTS_OVERALL_MAINTENANCE_POLICY to $PARTS_MAINTENANCE_GROUP..."
attachPolicyToGroup $PARTS_OVERALL_MAINTENANCE_POLICY $PARTS_MAINTENANCE_GROUP

info "...attaching update function role to policy $LOGS_POLICY ..."
attachRoleToPolicy $UPDATE_FUNCTION_ROLE $LOGS_POLICY
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi




info "...common functionalities setup done."