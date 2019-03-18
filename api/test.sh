#!/bin/sh

this_folder="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

CONTAINER=dynamodb4test

info "starting api tests..."

info "...starting db container..."
docker run -d -p 8000:8000 --name $CONTAINER amazon/dynamodb-local
_pwd=`pwd`
cd $this_folder/src
npm test
cd $_pwd
info "...stopping db container..."
docker stop $CONTAINER && docker rm $CONTAINER

info "...api test done."
