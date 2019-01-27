#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

__r=0

info "building api..."

_pwd=`pwd`
cd $this_folder/src

info "...building src..."
sam build --use-container
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not build src" && return 1; fi

info "...deploy built src to functions bucket..."
aws s3 mb s3://$BUCKET_FUNCTIONS
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not deploy src in bucket" && return 1; fi

info "...packaging api..."
sam package --output-template-file packaged.yaml --s3-bucket $BUCKET_FUNCTIONS
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not package the api" && return 1; fi

info "...deploying api..."
sam deploy --template-file packaged.yaml --stack-name $API_STACK --capabilities CAPABILITY_IAM --region $REGION
__r=$?
if [ ! "$__r" -eq "0" ] ; then err "could not deploy the api" && return 1; fi

cd $_pwd
info "...api build done."
