LOOPS_LIMIT=10
# usage:
#    . $this_folder/lib_include.sh
#
#    table=test
#    result=$(createTable "$table")
#    echo $result
createTable()
{
    local __r=0
    local __table=$1
    local __s=`aws dynamodb describe-table --output text --table-name $__table | grep "^TABLE" | awk '{print $8}'`
    if [ "$?" -eq "0" ]
    then
        if [ "$__s" -eq "DELETING" ]; then
            local __s2=0
            while [ "$__s2" -eq "0" ]
            do
                echo "\n...$__table still there being deleted...waiting...\n"
                sleep 5
                aws dynamodb describe-table --output text --table-name $__table
                __s2=$?
            done
            echo "\n...table $__table not there anymore.\n"
        else
            echo "\n*** ...table $__table is still there, try to delete it first!\n"
            __r=1
        fi
    fi
    
    if [ "$__r" -eq "0" ]; then
        aws dynamodb create-table --table-name $__table --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
        __r=$?
        if [ "$__r" -eq "0" ]; then
            local __s3="CREATING"
            while [ ! "$__s3" -eq "ACTIVE" ]
            do
                echo "\n...table $__table not yet active...waiting...\n"
                sleep 5
                __s3=`aws dynamodb describe-table --output text --table-name $__table | grep "^TABLE" | awk '{print $8}'`
            done
            echo "\n...table $__table is now active.\n"
            
        fi
    fi
    echo "$__r"
}

getTableState()
{
    local __r=""
    local __table=$1
    local __s=`aws dynamodb describe-table --output text --table-name $__table | grep "^TABLE" | awk '{print $8}'`
    if [ "$?" -eq "0" ]
    then
      __r=$__s  
    fi
    echo "$__r"
}

waitForTableState(){
    local __r=1
    local __table=$1
    local __state=$2
    
    local __e=0
    local __s="DUMMY"
    while [ "$__e" -eq "0" ] && [ ! "$__s" -eq "$__state" ]
    do
        __r
        echo "\n...$__table not at state $__state...waiting...\n"
        sleep 6
        __s=`aws dynamodb describe-table --output text --table-name $__table | grep "^TABLE" | awk '{print $8}'`
        __e=$?
        if [ "$__loops" -eq "$LOOPS_LIMIT" ]; then
            __r=2
            break
        fi
        __loops=$[$__loops+1]
    done
    
}

if [ -z "$s" ] ; then echo "empty"; else echo "not empty"; fi

deleteTable()
{
    local __r=0
    local __table=$1
    local __s=`aws dynamodb describe-table --output text --table-name $__table | grep "^TABLE" | awk '{print $8}'`
    if [ "$?" -eq "0" ]
    then
        if [ "$__s" -eq "DELETING" ]; then
            local __s2=0
            while [ "$__s2" -eq "0" ]
            do
                echo "\n...$__table still there being deleted...waiting...\n"
                sleep 5
                aws dynamodb describe-table --output text --table-name $__table
                __s2=$?
            done
            echo "\n...table $__table not there anymore.\n"
        else
            echo "\n*** ...table $__table is still there, try to delete it first!\n"
            __r=1
        fi
        aws dynamodb delete-table --table-name $__table    
        __r=$?
        if [ "$__r" -eq "0" ]
        then 
            local __s=0
            while [ "$__s" -eq "0" ]
            do
                echo "\n...$__table still there being deleted...waiting...\n"
                sleep 5
                aws dynamodb describe-table --output text --table-name $__table
                __s=$?
            done
            echo "\n...table $__table not there anymore.\n"
        fi
    else
        echo "\n*** ...table $__table is not there!"
    fi
    echo "$__r"
}