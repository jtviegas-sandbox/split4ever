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
_pwd=`pwd`
cd $this_folder

BUCKET=s3://$BUCKET_NAME/
aws s3 ls | grep $BUCKET_NAME
if [ "$?" -eq "0" ]
then
    echo "...found bucket $BUCKET ..."
else
    echo "...bucket [$BUCKET] not found, going to create..."
    aws s3 mb $BUCKET
    if [ ! "$?" -eq "0" ] ; then echo "!!! could not create bucket !!! ...leaving !!!" ; cd $_pwd; return -1; fi
    echo "...created bucket..."
fi

echo "...creating final template..."
aws cloudformation package --template-file $TEMPLATE --output-template-file $TEMPLATE_FINAL --s3-bucket $BUCKET_NAME
echo "...created final template..."

echo "...deploying the function..."
aws cloudformation deploy --template-file $TEMPLATE_FINAL --stack-name $STAGE --capabilities $CAPABILITY

if [ ! "$?" -eq "0" ] ; then 
    echo "!!! could not deploy function !!!"
else
    echo "...function deployed."
fi

rm $TEMPLATE_FINAL

cd $_pwd