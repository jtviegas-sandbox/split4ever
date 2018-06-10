#!/bin/sh
echo "building..."

folder=$(dirname $(readlink -f $0))
base=$(dirname $folder)

ARCHIVE_DIR=$base/dist
BACKEND=$base/backend
BACKEND_BUILD=$BACKEND/dist
BACKEND_DIST=$ARCHIVE_DIR

echo "...cleaning..."
rm -rf $ARCHIVE_DIR
echo "...building backend..."
cd $_pwd
echo "...moving to $BACKEND..."
cd $BACKEND
npm install
grunt -vd build
if [ "0" != "$?" ]; then
	echo "...backend build failed...leaving!!!"
	cd $_pwd
	return 1
fi
cd $_pwd

mkdir -p $ARCHIVE_DIR
echo "...moving backend build to dist..."
cp -r $BACKEND_BUILD/* $BACKEND_DIST/


echo "...done."


