#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/include

createBucket()
{
    echo "creating bucket named $1..."
    BUCKET_NAME=$1.$DOMAIN
    BUCKET=s3://$BUCKET_NAME/
    aws s3 ls | grep $BUCKET_NAME
    if [ "$?" -eq "0" ]
    then
        echo "...found bucket $BUCKET ..."
    else
        echo "...bucket [$BUCKET] not found, going to create..."
        aws s3 mb $BUCKET
        if [ ! "$?" -eq "0" ] ; then echo "!!! could not create bucket !!! ...leaving !!!" ; cd $_pwd; return -1; fi
        echo "...created bucket $BUCKET..."
    fi
}

echo "creating buckets for project $PROJ..."

for b in $BUCKET_NAMES; do
   createBucket "$b" 
done

echo "... creating buckets for project $PROJ done."