#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $this_folder/include

export AWS_REGION=$REGION

_pwd=`pwd`
cd $parent_folder
mocha test
cd $_pwd