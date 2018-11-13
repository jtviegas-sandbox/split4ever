#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $this_folder/lib
. $this_folder/include

__r=0
buckets/setup.sh
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

tables/setup.sh
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

functions/setup.sh
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

info "setup finished"