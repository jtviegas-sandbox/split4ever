#!/bin/sh

usage()
{
        cat <<EOM
        usage:
        $(basename $0) <stage>
EOM
        exit 1
}

[ -z $1 ] && { usage; }

STAGE=$1

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $this_folder/include

echo "deploying stack $STAGE with function $FUNCTION_NAME ..."

aws iam create-policy --policy-name $POLICY --policy-document file://$POLICY_FILE
