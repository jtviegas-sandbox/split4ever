"use strict";

var fs = require('fs');

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
                                if(doc.category && Array.isArray(doc.category)){ \
                                    for(var i=0; i<doc.category.length; i++){ \
                                        emit(doc.category[i], 1); } }}"
                            , "reduce": "_count"
                        }
                        , "models" : {
                            "map": "function(doc) { \
                                if(doc.model && Array.isArray(doc.model)){ \
                                    for(var i=0; i<doc.model.length; i++){ \
                                        emit(doc.model[i], 1); } }}"
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
        , "replicationDelay": 24*60*60*1000

    };

    if(fs.existsSync(__dirname + "/credentials.PWD")) {
        database.credentials = require(__dirname + "/credentials.PWD");
    }
    else  {
        database.credentials = {
            "user": process.env.DB_USER
            , "pswd": process.env.DB_PASSWD
        }
    }

    var log = {
        dir: process.env.LOG_DIR || './logs'
        , level: process.env.LOG_LEVEL || 'info'
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
