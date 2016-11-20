"use strict";
var Config = function() {

    var app = {
        name: 'split4ever'
    };

    var dbNameSuffix = "_" + ( process.env.MODE ? process.env.MODE.toLowerCase() : "prod" );

    var database = {
        "instances": {
            "part" : {
                "name": "part" + dbNameSuffix
                , "designDoc": {
                    "_id": "_design/" + "part" + dbNameSuffix
                    , "language": "javascript"
                    , "views": {
                        "categories" : {
                            "map": "function(doc) { \
                                emit(doc.category, doc.subCategory); \
                                }"
                            , "reduce": "function(key, values, rereduce) { \
                                        var r = []; \
                                        var flatten = function(arr){ \
                                            var result = []; \
                                              for(var i=0; i<arr.length; i++){ \
                                                var o = arr[i]; \
                                                if( Array.isArray(o) ) \
                                                    Array.prototype.push.apply(result, flatten(o)); \
                                                else \
                                                    result.push(o); } \
                                                return result; }; \
                                            var flattened = flatten(values); \
                                            for(var i=0; i<flattened.length; i++){ \
                                                var n = flattened[i]; \
                                                if(0 > r.indexOf(n)){ \
                                                    r.push(n); } } \
                                            return r;}"
                        }
                        , "models" : {
                            "map": "function(doc) { \
                                if(doc.model){ \
                                    emit(doc.model, 1); \
                                }}"
                            , "reduce": "_count"
                        }
                        , "numOf" : {
                            "map": "function(doc) { \
                                    emit(doc._id, 1); \
                                }"
                            , "reduce": "function (keys, values, rereduce) { var result = 0; for(var i=0; i<values.length; i++){ result += values[i]; } return result; }"

                        }
                    }
                }
            }
        }

    };
    database.credentials = require(__dirname + "/credentials.PWD");

    var log = {
        dir: process.env.LOG_DIR || './logs'
        , level: process.env.LOG_LEVEL || 'debug'
        , filename: process.env.LOG_FILENAME || 'trace.log'
        , filesize: process.env.LOG_FILESIZE || 1048576
        , filenum: process.env.LOG_FILENUM || 5
    }

    return {
        app: app
        , database: database
        , log: log
    };

}();

module.exports = Config;
