#!/bin/sh

echo "[@build]...running..."
folder=$(dirname $(readlink -f $0))
$folder/build.sh
echo "[@build]...done."


