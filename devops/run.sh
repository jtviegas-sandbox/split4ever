#!/bin/sh

echo "running..."
folder=$(dirname $(readlink -f $0))
base=$(dirname $folder)

SERVER_DIST=$base/dist
_pwd=`pwd`
cd $SERVER_DIST
echo "...retriving modules..."
npm install --production

echo "...starting..."
node index.js
cd $_pwd
echo "...done."


