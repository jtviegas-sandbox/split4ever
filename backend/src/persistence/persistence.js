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
                    logger.debug('[persistence.checkInitialization] ...initialized! going to setup replication jobs');
                    setInterval(replicate, config.database.replicationDelay)
                    func.apply(this, args || []);
                }
            };
            db.init(localCallback);
            return true;
        }
        logger.debug('[persistence.checkInitialization] OUT');
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
                    callback(null, r);
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

    var dropReplicas = function(dbName, callback){
        logger.debug('[persistence.dropReplicas] IN');
        if(checkInitialization(dropReplicas, [ dbName, callback ], callback) ) return;

        db.getDbNames(function(err, os){
            if(err){
                logger.error(err);
                if(callback)
                    callback(err);
            }
            else {
                if(0 < os.length){
                    var toDelete = [];
                    os.forEach(function(value, index, array){
                        if(value.match(dbName + '.*_replica_.*'))
                            toDelete.push(value);
                    });

                    if(0 < toDelete.length){
                        toDelete.forEach(function(value, index, array) {
                            logger.debug('going to drop %s replica db', value);
                            if (index == (array.length - 1)) {
                                db.deleteDb(value, function (err, r) {
                                    if (err) {
                                        logger.error(err);
                                        if (callback)
                                            callback(err);
                                    }
                                    else {
                                        logger.debug('dropped %s db', value);
                                        if (callback)
                                            callback(null, r.ok);
                                    }
                                });
                            }
                            else {
                                db.deleteDb(value);
                            }
                        });
                    }
                    else {
                        if(callback)
                            callback(null, true);
                    }
                }
                else {
                    if(callback)
                        callback(null, true);
                }

            }
        });
        logger.debug('[persistence.dropReplicas] OUT');
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
                if(Array.isArray(o) && 0 < o.length){
                    o.forEach(function(m){
                        results.push(m.key);
                    });
                }
                callback(null, results);
            }
        );

        logger.debug('[persistence.getCategories] OUT');
    };

    var getNPartsFromId = function(params, callback) {
        logger.debug('[persistence.getNPartsFromId] IN');

        if (checkInitialization(getNPartsFromId, [params, callback], callback)) return;

        if ("0" == params.id || 0 == params.id)
            params.id = 0;

        var options = {
            "selector": {
                "_id": {"$gt": params.id}
                , "$not": {"_id": {"$regex": "_design/.*"}}
            }
            , "sort": [{"_id": "asc"}]
            , "limit": params.n
        };

        if (null != params.category) {
            //options.selector.category = params.category;
            options.selector.category = {"$elemMatch": { "$eq": params.category} }
        }
        if (null != params.model) {
            //options.selector.model = params.model;
            options.selector.model = {"$elemMatch": { "$eq": params.model} }
        }
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

    var replicate = function(callback){
        logger.debug('[persistence.replicate] IN');

        if(checkInitialization(replicate, [ callback ], callback) ) return;
        db.getDbNames(function(err,r){
            if(err){
                logger.error(err);
                if(callback)
                    return callback(err);
            }
            else {
                var toReplicate = r.filter(function (value) {
                    return (null != value.match('.*_prod'))
                });

                if (0 < toReplicate.length){
                    toReplicate.forEach(function (el, index, array) {
                        logger.debug(util.format("[persistence.replicate] replicating db %s", el));
                        var handler = function (isLast, cback, name) {
                            var f = function (err, r) {
                                if (err) {
                                    logger.error(err);
                                    if (cback)
                                        cback(err);
                                }
                                else {
                                    logger.debug(util.format("[persistence.replicate] successfully replicated db %s", name));
                                    if (isLast && cback)
                                        cback(null, true);
                                }
                            };
                            return {func: f};
                        }((index == (array.length - 1)), callback, el);

                        var target = el + '_replica_' + new Date().getDay();
                        logger.debug(util.format("[persistence.replicate] going to replicate db %s to %s", el, target));
                        db.replicateDb(el, target, handler.func);

                    });
                }
                else {
                    if (callback)
                        callback(null, true);
                }
            }

        });

        logger.debug('[persistence.replicate] OUT');
    };


    var replicate = function(callback){
        logger.debug('[persistence.replicate] IN');

        if(checkInitialization(replicate, [ callback ], callback) ) return;
        db.getDbNames(function(err,r){
            if(err){
                logger.error(err);
                if(callback)
                    return callback(err);
            }
            else {
                var toReplicate = r.filter(function (value) {
                    return (null != value.match('.*_prod$'))
                });

                if (0 < toReplicate.length){
                    toReplicate.forEach(function (el, index, array) {
                        logger.debug(util.format("[persistence.replicate] replicating db %s", el));

                        var target = el + '_replica_' + new Date().getDay();
                        logger.debug(util.format("[persistence.replicate] going to replicate db %s to %s", el, target));
                        if( index == (array.length-1) ){
                            db.replicateDb(el, target, function(err, r){
                                if (err) {
                                    logger.error(err);
                                    if (callback)
                                        callback(err);
                                }
                                else {
                                    logger.debug(util.format("[persistence.replicate] successfully replicated db %s", el));
                                    if (callback)
                                        callback(null, true);
                                }
                            });
                        }
                        else
                            db.replicateDb(el, target);
                    });
                }
                else {
                    if (callback)
                        callback(null, true);
                }
            }

        });

        logger.debug('[persistence.replicate] OUT');
    };

/*    var getAllParts = function(callback){
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
            , {"include_docs": true}
        );
        logger.debug('[persistence.getAllParts] OUT');
    };*/

/*    var getParts = function(callback){
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
        );

        logger.debug('[persistence.getParts] OUT');
    };*/

    var numOfParts = function(callback){
        logger.debug('[persistence.numOfParts] IN');

        if(checkInitialization(numOfParts, [ callback ], callback) ) return;
        db.numOf(config.database.instances.part.name, function(err, o){
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


    var getPartsCount = function(params, callback) {
        logger.debug('[persistence.getPartsCount] IN');
        if (checkInitialization(getPartsCount, [params, callback], callback)) return;

        var options = {
            "selector": {
                 "$not": {"_id": {"$regex": "_design/.*"}}
            }
        };

        if (null != params.category) {
            options.selector.category = {"$elemMatch": { "$in": params.category} }
        }
        if (null != params.model) {
            options.selector.model = {"$elemMatch": { "$in": params.model} }
        }

        db.getDocs(config.database.instances.part.name, options,
            function(err, r){
                if(err){
                    logger.error(err);
                    if(callback)
                        callback(err);
                }
                else{
                    if(callback) {
                        callback(null, r.length);
                    }
                }

            }
            , false
        );
        logger.debug('[persistence.getPartsCount] OUT');
    };

    var getParts = function(params, callback) {
        logger.debug('[persistence.getParts] IN');
        if (checkInitialization(getParts, [params, callback], callback)) return;

        var options = {
            "selector": {
                "$not": {"_id": {"$regex": "_design/.*"}}
            }
        };

        if("true" == params.inclusive)
            options.selector._id = {"$gte": params.id}
        else
            options.selector._id = {"$gt": params.id}

        if (null != params.category) {
            options.selector.category = {"$elemMatch": { "$eq": params.category} }
        }
        if (null != params.model) {
            options.selector.model = {"$elemMatch": { "$eq": params.model} }
        }
        options.sort = [ {"_id": "asc"} ];

        if (params.n)
            options.limit = params.n

        db.getDocs(config.database.instances.part.name, options,
            function(err, r){
                if(err){
                    logger.error(err);
                    if(callback)
                        callback(err);
                }
                else{
                    if(callback) {
                        callback(null, r);
                    }
                }

            }
            , false
        );
        logger.debug('[persistence.getParts] OUT');
    };


    // ---------------------------------------------------------------------------

    return {
        getSpotlightParts: getSpotlightParts
        /*, getParts: getParts*/
        , setPart: setPart
        , delAllParts: delAllParts
        , dropPartsDb: dropPartsDb
        , delPart: delPart
        , numOfParts: numOfParts
        , getModels: getModels
        , getCategories: getCategories
        , getNPartsFromId: getNPartsFromId
        , getPart: getPart
    /*    , getAllParts: getAllParts*/
        , replicate: replicate
     /*   , getFilteredPartsFromId: getFilteredPartsFromId*/
        , dropReplicas: dropReplicas
        , getPartsCount: getPartsCount
        , getParts: getParts
    };

}();

module.exports = Persistence;
