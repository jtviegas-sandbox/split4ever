#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $this_folder/lib
. $this_folder/include

functions/reset.sh
iam/reset.sh
tables/reset.sh
buckets/reset.sh


info "reset finished"