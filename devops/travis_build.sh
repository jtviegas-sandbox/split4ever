#!/bin/sh

echo "running..."
folder=$(dirname $(readlink -f $0))
base=$(dirname $folder)

npm install bower
npm install grunt-cli
$folder/build.sh

echo "...done."


