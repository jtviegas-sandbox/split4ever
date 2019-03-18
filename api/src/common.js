'use strict';
const util = require('util');
const config = require("./config");

const common_module = function(){
    
    var parseKey = (keyStr) => {
        console.log("[parseKey|in] <=", keyStr);
        let separatorLastIndex = keyStr.lastIndexOf(config.default_key_separator);
        let result = {
          id: keyStr.substring(0,separatorLastIndex)
            , number: parseInt(keyStr.substring(separatorLastIndex+1))
        };
        console.log("[parseKey|out] =>", result);
        return result;
    }
    
    var encodeKey = (key) => {
        console.log("[encodeKey|in] <=", key);
        let result = key.id + config.default_key_separator + key.number
        console.log("[encodeKey|out] =>", result);
        return result;
    }
    
    var findPagesize = (event) => {
        console.log("[findPagesize|in] <=", event);
        let result = config.pagesize;
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
        console.log("[findPagesize|out] =>", result);
        return result;
    }

    var findLastKey = (event) => {
        console.log("[findLastKey|in] <=", event);
        let result = null;

        if( event.queryStringParameters && event.queryStringParameters.lastkey )
            result = parseKey(event.queryStringParameters.lastkey);

        console.log("[findLastKey|out] =>", result);
        return result;
    }
    
    var findTable = (event) => {
        console.log("[findTable|in] <=", event);
        let result = config.table_prod;
        if( event.queryStringParameters && event.queryStringParameters.dev && 'true' === event.queryStringParameters.dev )
                result = config.table_dev;

        console.log("[findTable|out] =>", result);
        return result;
    }
    
    return {
        parseKey: parseKey
        , encodeKey: encodeKey
        , findPagesize: findPagesize
        , findLastKey: findLastKey
        , findTable: findTable
    };
    
}();


module.exports = common_module;
