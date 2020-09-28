#!/bin/sh

#this_folder=$(dirname $(readlink -f $0))
this_folder="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

__r=0

info "setting up datastore..."

for table in $TABLES; do
    createTable "$table"
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then exit 1; fi
done

tables_arn=
for _table in $TABLES; do
    arn=`aws dynamodb describe-table --output text --table-name $_table | grep arn.*$_table | awk '{print $4}'`
    arn=`echo $arn  | sed "s/\//\\//g"`

    if [ -z $tables_arn ]; then
        tables_arn="$arn"
    else
        tables_arn="$tables_arn,$arn"
    fi
done

policy_for_tables_update_actions=$(buildPolicy "Allow" "$POLICY_FOR_TABLES_UPDATE_ACTIONS" "$tables_arn")
info "...creating policy: $POLICY_FOR_TABLES_UPDATE..."
createPolicy $POLICY_FOR_TABLES_UPDATE "$policy_for_tables_update_actions"
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi

info "...attaching role $ROLE_FOR_STORE_UPDATE_FUNCTION to policy $POLICY_FOR_TABLES_UPDATE ..."
attachRoleToPolicy $ROLE_FOR_STORE_UPDATE_FUNCTION $POLICY_FOR_TABLES_UPDATE
__r=$?
if [ ! "$__r" -eq "0" ] ; then exit 1; fi


info "...datastore setup done."

