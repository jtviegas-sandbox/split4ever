#!/bin/sh

echo "running..."
folder=$(dirname $(readlink -f $0))
base=$(dirname $folder)

npm -g install bower
npm -g install grunt-cli
$folder/build.sh

echo "...done."


