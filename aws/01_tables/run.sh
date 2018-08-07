#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/include

echo "creating tables for project $PROJ..."

createTable()
{
    echo "creating table $1..."
    table=$1   
    aws dynamodb list-tables --output text | grep $table
    if [ "$?" -eq "0" ]
    then
        echo "...table $table was already created"
    else
        aws dynamodb create-table --table-name $table --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
        if [ ! "$?" -eq "0" ] ; then echo "!!! could not create table $table !!! ...leaving !!!" ; cd $_pwd; return -1; fi
        echo "...created table $table"  
    fi
}

for t in $TABLES; do
    createTable "$t" 
done

echo "... creating tables for project $PROJ done."
