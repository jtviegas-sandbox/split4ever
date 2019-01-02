'use strict';
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

var findPagesize = (event) => {
    console.log("[findPagesize|in]");
    let result = process.env.PAGE_SIZE;
    try {
        if( event.queryStringParameters && event.queryStringParameters.pagesize ){
            let pagesize = parseInt(event.queryStringParameters.pagesize);
            if( ! isNaN(pagesize) )
                result = pagesize;
        }
    }
    catch(e){
        console.log("[findPagesize] could not parse pagesize", event.queryStringParameters.pagesize);
    }
    console.log("[findPagesize|out]", result);
    return result;
}

var findN = (event) => {
    console.log("[findN|in]");
    let result = 0;
    try {
        if( event.queryStringParameters && event.queryStringParameters.n ){
            let n = parseInt(event.queryStringParameters.n);
            if( ! isNaN(n) )
                result = n;
        }
    }
    catch(e){
        console.log("[findN] could not parse number", event.queryStringParameters.n);
    }

    console.log("[findN|out]", result);
    return result;
}

var findTable = (event) => {
    console.log("[findTable|in]");
    let result = process.env.TABLE_NAME;
    if( event.queryStringParameters && event.queryStringParameters.dev )
            result = result + '_DEV';

    console.log("[findTable|out]", result);
    return result;
}

var getPagedObjs = (table, n, pagesize,callback) => {
   console.log("[getPagedObjs|in] table:", table, " n:", n," pagesize:", pagesize);
    
    let params = {
            ExpressionAttributeValues: {
                ':n': n
                ,':id': 'a'
            }
            , KeyConditionExpression: 'n >= :n and id > :id'
            , TableName: table
            , Limit: pagesize
            , ScanIndexForward: true
        };
    
    if( -1 === n ){
        params['ExpressionAttributeValues'] = { ':n': 0 };
        params['ScanIndexForward'] = false;
    }
    
    db.query(params, callback);
    
    console.log("[getPagedObjs|out]"); 
}

var getObj = (table, id, callback) => {
    console.log("[getObj|in] table:", table, " id:", id);
    
    let params = {
      ExpressionAttributeValues: {
        ':id': id,
        ':n': 0
       },
     KeyConditionExpression: 'id = :id and n >= :n',
     TableName: table
    };
    db.query(params, callback);
    
    console.log("[getObj|out]");
}

exports.handler = (event, context, callback) => {
    console.log("[handler|in] event:", JSON.stringify(event, null, 2));
    
    const done = (err, res) => callback( null, {
        statusCode: err ? 400 : 200,
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if( event.httpMethod !== 'GET' ){
        done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
    else {
        let table = findTable(event);
        if( event.pathParameters && event.pathParameters.id ){
            getObj(table, event.pathParameters.id, done);
        }
        else {
            let pagesize = findPagesize(event);
            let n = findN(event);
            getPagedObjs(table, n, pagesize, done);
        }
    }
    console.log("[handler|out]");
}

