#!/bin/sh

echo "[@deploy]...running..."
folder=$(dirname $(readlink -f $0))
base=$(dirname $folder)
SERVER_DIST=$base/dist
_pwd=`pwd`

echo "folder is $folder"
echo "base is $base"
execution=`ls $base`
echo "ls in base: $execution"
$folder/my_bluemixLogin.sh
cd $SERVER_DIST
$folder/cf push
echo "[@deploy]...done."


