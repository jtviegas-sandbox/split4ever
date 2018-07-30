#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $this_folder/include

SRC=$parent_folder/src
_pwd=`pwd`

cd $SRC

rm -f $ZIP_FILE
zip -9 $ZIP_FILE $FUNCTION_FILE 

ALIAS=dev
if [ ! -z $1 ]
then
	ALIAS=$1
fi

aws lambda create-function --function-name $FUNCTION_NAME --zip-file fileb://$ZIP_FILE --role $ROLE --handler $HANDLER --runtime $RUNTIME --memory-size $MEMORY --publish

aws lambda create-alias --function-name $FUNCTION_NAME --name $ALIAS --function-version "\$LATEST"

rm $ZIP_FILE

cd $_pwd