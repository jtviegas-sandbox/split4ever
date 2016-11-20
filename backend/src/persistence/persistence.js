/**
 * Created by joaovieg on 07/11/16.
 */
"use strict";

var config = require('./../common/config');
var logger = require('./../common/apputils').logger;
var db = require('./db');
var util = require('util');
var utils = require('./../common/customutils');

var Persistence = function(){

    // ---------------------------------------------------------------------------
    // ----------------------------------PRIVATE METHODS--------------------------

    var checkInitialization = function(func, args, callback){
        logger.debug('[persistence.checkInitialization] IN');

        if(!db.isInitialized()){
            logger.debug('[persistence.checkInitialization] initializing....');
            var localCallback = function(err){
                if(err){
                    logger.error(err);
                    if(callback)
                        callback(err);
                }
                else {
                    logger.debug('[persistence.checkInitialization] ...initialized!');
                    func.apply(this, args || []);
                }
            };
            db.init(localCallback);
            return true;
        }
        logger.debug('[persistence.checkInitialization] OUT');
    };

    var numOf = function(dbName, callback){
        logger.debug('[persistence.numOf] IN');

        if(checkInitialization(numOf, [ dbName, callback ], callback) ) return;
        var options = { reduce: true, group: false};

        db.getView(config.database.instances.part.name, 'numOf', options,
            function(err, o){
                if(err){
                    logger.error(err);
                    if(callback)
                        return callback(err);
                }
                var result = 0;
                if(Array.isArray(o) && 0 < o.length)
                    result = o[0].value;

                callback(null, result);
            }
        );

        logger.debug('[persistence.numOf] OUT');
    };
    // ---------------------------------------------------------------------------
    // ----------------------------------PUBLIC  METHODS--------------------------

    var getSpotlightParts = function(callback){
        logger.debug('[persistence.getSpotlightParts] IN');

        if(checkInitialization(getSpotlightParts, [ callback ], callback) ) return;
        var localCallback = function(err, result){
            if(err){
                logger.error(err);
                callback(err);
            }
            else
                callback(null, result);
        };

        var options =  { 'selector': {
                "_id": { "$gt": 0 }
                , "spotlight": 1
            }  };

        db.getSome(config.database.instances.part.name, options, localCallback, false);
        logger.debug('[persistence.getSpotlightParts] OUT');
    };

    var getParts = function(options, callback){
        logger.debug('[persistence.getParts] IN');

        if(checkInitialization(getParts, [ options, callback ], callback) ) return;

        db.getAll(config.database.instances.part.name,
            function(err, o){
                if(err){
                    logger.error(err);
                    if(callback)
                        return callback(err);
                }

                callback(null, o.result);
            }
            , options
        );

        logger.debug('[persistence.getParts] OUT');
    };

    var setPart = function(part, callback){
        logger.debug('[persistence.setPart] IN');

        if(checkInitialization(setPart, [ part, callback ], callback) ) return;
        db.post(config.database.instances.part.name, part, function(err, r){
            if(err){
                logger.error(err);
                if(callback)
                    callback(err);
            }
            else {
                if(callback)
                    callback(null, r.result);
            }
        });
        logger.debug('[persistence.setPart] OUT');
    };

    var delAllParts = function(callback){
        logger.debug('[persistence.delAllParts] IN');

        if(checkInitialization(delAllParts, [ callback ], callback) ) return;
        db.delAll(config.database.instances.part.name, function(err, r){
            if(err){
                logger.error(err);
                if(callback)
                    callback(err);
            }
            else {
                logger.debug('deleted %d rows', r.result);
                if(callback)
                    callback(null, r.result);
            }
        });
        logger.debug('[persistence.delAllParts] OUT');
    };

    var dropPartsDb = function(callback){
        logger.debug('[persistence.dropPartsDb] IN');

        if(checkInitialization(dropPartsDb, [ callback ], callback) ) return;
        db.deleteDb(config.database.instances.part.name, function(err, r){
            if(err){
                logger.error(err);
                if(callback)
                    callback(err);
            }
            else {
                logger.debug('dropped %s db', config.database.instances.part.name);
                if(callback)
                    callback(null, r.ok);
            }
        });
        logger.debug('[persistence.dropPartsDb] OUT');
    };

    var delPart = function(o, callback){
        logger.debug('[persistence.delPart] IN');

        if(checkInitialization(delPart, [ o, callback ], callback) ) return;
        db.del(config.database.instances.part.name, o, function(err, r){
            if(err){
                logger.error(err);
                if(callback)
                    callback(err);
            }
            else {
                logger.debug('dropped %s db', config.database.instances.part.name);
                if(callback)
                    callback(null, r.result);
            }
        });
        logger.debug('[persistence.delPart] OUT');
    };

    var numOfParts = function(callback){
        logger.debug('[persistence.numOfParts] IN');

        if(checkInitialization(numOfParts, [ callback ], callback) ) return;

        numOf(config.database.instances.part.name,
            function(err, o){
                if(err){
                    logger.error(err);
                    if(callback)
                        return callback(err);
                }

                callback(null, o);
            }
        );

        logger.debug('[persistence.numOfParts] OUT');
    };

    var getModels = function(callback){
        logger.debug('[persistence.getModels] IN');

        if(checkInitialization(getModels, [ callback ], callback) ) return;
        var options = { reduce: true, group: true};

        db.getView(config.database.instances.part.name, 'models', options,
            function(err, o){
                if(err){
                    logger.error(err);
                    if(callback)
                        return callback(err);
                }
                var results=[];
                if(Array.isArray(o) && 0 < o.length){
                    o.forEach(function(m){
                        results.push(m.key);
                    });
                }
                callback(null, results);
            }
        );

        logger.debug('[persistence.getModels] OUT');
    };

    var getCategories = function(callback){
        logger.debug('[persistence.getCategories] IN');

        if(checkInitialization(getCategories, [ callback ], callback) ) return;
        var options = { reduce: true, group: true};

        db.getView(config.database.instances.part.name, 'categories', options,
            function(err, o){
                if(err){
                    logger.error(err);
                    if(callback)
                        return callback(err);
                }
                var results=[];
                if(Array.isArray(o) && 0 < o.length)
                    results = o;

                callback(null, results);
            }
        );

        logger.debug('[persistence.getCategories] OUT');
    };

    var getNPartsFromId = function(params, callback){
        logger.debug('[persistence.getNPartsFromId] IN');

        if(checkInitialization(getNPartsFromId, [ params, callback ], callback) ) return;

        if("0" == params.id || 0 == params.id)
            params.id=0;

        var options =  { "selector": {
                                "_id": { "$gt": params.id }
                                ,  "$not":{ "_id": { "$regex": "_design/.*" } }
                            }
                            , "sort": [ { "_id": "asc" } ]
                            , "limit": params.n
                        };

        if(null != params.category)
            options.selector.category = params.category;
        if(null != params.model)
            options.selector.model = params.model;

        db.getSome(config.database.instances.part.name, options,
            function(err, r){
                if(err){
                    logger.error(err);
                    if(callback)
                        callback(err);
                }
                else
                if(callback)
                    callback(null, r);
            }
        );
        logger.debug('[persistence.getNPartsFromId] OUT');
    };

    var getPart = function(id, callback){
        logger.debug('[persistence.getPart] IN');
        if(checkInitialization(getPart, [ id, callback ], callback) ) return;
        db.get(config.database.instances.part.name, id,
            function(err, o){
                if(err){
                    logger.error(err);
                    if(callback)
                        return callback(err);
                }
                else
                    callback(null, o);
            }
        );
        logger.debug('[persistence.getPart] OUT');
    };

    var getAllParts = function(callback){
        logger.debug('[persistence.getAllParts] IN');
        if(checkInitialization(getAllParts, [ callback ], callback) ) return;
        db.getAll(config.database.instances.part.name,
            function(err, o){
                if(err){
                    logger.error(err);
                    if(callback)
                        return callback(err);
                }
                else
                    callback(null, o);
            }
        );
        logger.debug('[persistence.getAllParts] OUT');
    };

    var delPart = function(options, callback){
        logger.debug('[persistence.delPart] IN');
        if(checkInitialization(delPart, [ options, callback ], callback) ) return;
        db.del(config.database.instances.part.name, options,
            function(err, o){
                if(err){
                    logger.error(err);
                    if(callback)
                        callback(err);
                }
                else
                    callback(null, o);
            }
        );
        logger.debug('[persistence.delPart] OUT');
    };

    var setPart = function(o, callback){
        logger.debug('[persistence.setPart] IN');
        if(checkInitialization(setPart, [ o, callback ], callback) ) return;
        db.post(config.database.instances.part.name, o,
            function(err, o){
                if(err){
                    logger.error(err);
                    if(callback)
                        return callback(err);
                }
                else
                    callback(null, o);
            }
        );
        logger.debug('[persistence.setPart] OUT');
    };

    // ---------------------------------------------------------------------------

    return {
        getSpotlightParts: getSpotlightParts
        , getParts: getParts
        , setPart: setPart
        , delAllParts: delAllParts
        , dropPartsDb: dropPartsDb
        , delPart: delPart
        , numOfParts: numOfParts
        , getModels: getModels
        , getCategories: getCategories
        , getNPartsFromId: getNPartsFromId
        , getPart: getPart
        , getAllParts: getAllParts
    };

}();

module.exports = Persistence;
