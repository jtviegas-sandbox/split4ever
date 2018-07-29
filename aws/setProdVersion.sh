#!/bin/sh

usage()
{
        cat <<EOM
        usage:
        $(basename $0) <function version>
EOM
        exit 1
}

[ -z $1 ] && { usage; }

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $this_folder/include

ALIAS=prod
VERSION=$1

aws lambda update-alias --function-name $FUNCTION_NAME --name $ALIAS --function-version $VERSION

