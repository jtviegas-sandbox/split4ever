'use strict';
const AWS = require("aws-sdk");
const util = require('util');
const config = require("./config");
const common = require("./common");
const datalayer = require("./datalayer");


exports.handler = (event, context, callback) => {
    console.log("[handler|in] <=", JSON.stringify(event));
    
    const done = (err, res) => callback( null, {
        statusCode: err ? 400 : 200,
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
    });

    if( event.httpMethod !== 'GET' ){
        done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
    else {
        let table = common.findTable(event);
        if( event.pathParameters && event.pathParameters.key ){
            let key = event.pathParameters.key;
            datalayer.getObj(table, key, (e,d)=>{
                if(e)
                    done(e);
                else
                    done(null, d);
            });
        }
        else {
            let lastKey = event.queryStringParameters.lastkey;
            let pageSize = common.findPagesize(event);
            
            datalayer.getPagedObjs(table, pageSize, lastKey, (e,d)=>{
                console.log(util.inspect(d,  { compact: true, depth: 5 }));
                if(e)
                    done(e);
                else
                    done(null, d);
            });
        }
    }
    console.log("[handler|out]");
}

