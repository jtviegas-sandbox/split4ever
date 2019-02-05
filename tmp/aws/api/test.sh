#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

CONTAINER=dynamodb4test

info "starting api tests..."

docker run -d -p 8000:8000 --name $CONTAINER amazon/dynamodb-local
_pwd=`pwd`
cd $this_folder/src
npm test
cd $_pwd
docker stop $CONTAINER && docker rm $CONTAINER


info "...api test done."
