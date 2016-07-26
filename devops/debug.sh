#!/bin/sh

echo "running..."
folder=$(dirname $(readlink -f $0))
base=$(dirname $folder)

SERVER_DIST=$base/dist
_pwd=`pwd`
cd $SERVER_DIST
echo "...retriving modules..."
npm install
echo "ATTENTION: do please install node debug as root:  'npm install -g node-debug' "
echo "...starting..."
node-debug index.js
cd $_pwd
echo "...done."


