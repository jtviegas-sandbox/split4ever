#!/bin/sh

echo "[@deploy]...running..."
folder=$(dirname $(readlink -f $0))
base=$(dirname $folder)
SERVER_DIST=$base/dist
_pwd=`pwd`

$folder/my_bluemixLogin.sh
cd $SERVER_DIST
$folder/cf push
echo "[@deploy]...done."


