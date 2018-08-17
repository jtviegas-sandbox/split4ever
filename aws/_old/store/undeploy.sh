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

echo "undeploying stack $STAGE with function $FUNCTION_NAME ..."

aws cloudformation delete-stack --stack-name $STAGE

if [ ! "$?" -eq "0" ] ; then 
    echo "!!! could not undeploy function !!!"
else
    echo "...function undeployed."
fi
