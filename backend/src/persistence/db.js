/**
 * Created by joaovieg on 07/11/16.
 */

var Cloudant = require('cloudant');
var util = require('util');
var config = require('./../common/config');
var utils = require('./../common/customutils');
var logger = require('./../common/apputils').logger;

var Db = function(){

    var connection = null;
    var initialized = false;

    // ---------------------------------------------------------------------------
    // ----------------------------------PRIVATE METHODS--------------------------
    var resolveCredentials = function(){
        logger.debug('[Db.resolveCredentials] IN');
        var credentials = {
            usr: null
            , pswd: null
        };
        if (process.env.VCAP_SERVICES) {
            var services = JSON.parse(process.env.VCAP_SERVICES);
            var cloudant_info = services.cloudantNoSQLDB[0];
            credentials.usr = cloudant_info.credentials.username;
            credentials.pswd = cloudant_info.credentials.password;
            logger.info("[Db.resolveCredentials] got credentials from vcap env var");
        }
        else {
            if(process.env.DB_USR && process.env.DB_PSWD){
                credentials.usr = process.env.DB_USR;
                credentials.pswd = process.env.DB_PSWD;
                logger.info("[Db.resolveCredentials] got credentials from environment");
            }
            else {
                credentials.usr = config.database.credentials.user;
                credentials.pswd = config.database.credentials.pswd;
                logger.info("[Db.resolveCredentials] got credentials from config");
            }
        }

        logger.debug('[Db.resolveCredentials] OUT');
        return credentials;
    };

    var createDb = function(name, callback){
        logger.debug('[Db.createDb] IN');
        connection.db.create(name,function(err, o){
            if(err && err.message != "The database could not be created, the file already exists."){
                logger.error(util.format("[Db.createDb] err: %s", err.message));
                if(callback){
                    callback(err);
                }
            }
            else {
                logger.info(util.format("[Db.createDb] created db %s", name));
                if(callback){
                    callback(null);
                }
            }
        });
        logger.debug('[Db.createDb] OUT');
    };

    var getSome  = function(db, options, callback, designDocsAlso) {

        logger.debug('[Db.getSome] IN');
        var dbObj = connection.use(db);

        var getAllCallback = function(cb){

            var f = function(err, r){
                if(err){
                    logger.error(err);
                    if(cb)
                        cb(err);
                }
                else {
                    var result = [];
                    if(designDocsAlso){
                        Array.prototype.push.apply(result, r.docs);
                    }
                    else {
                        r.docs.forEach(function(doc) {
                            if( 0 > doc._id.indexOf('_design'))
                                result.push(doc);
                        });
                    }
                    logger.info(util.format("[Db.getSome] got %d docs", result.length));
                    if(cb)
                        cb(null, result)
                }
            };

            return { f: f };

        }(callback);

        dbObj.find(options, getAllCallback.f);

        logger.debug('[Db.getSome] OUT');
    };

    var getDesignDoc = function(db, callback){
        logger.debug('[Db.getDesignDoc] IN');
        var localCallback = function(err, result){
            console.log(JSON.stringify(result));
            if(err){
                callback(err)
            }
            else {
                var r = null;
                if(Array.isArray(result) && 0 < result.length)
                    r = result[0];
                callback(null, r);
            }
        };
        var options =  {
            'selector':
            { '_id':
            { '$eq': '_design/' + db }
            }
        };
        getSome(db, options, localCallback, true);
        logger.debug('[Db.getDesignDoc] OUT');
    };

    /*
     we create one design doc per document db
     */
    var storeDesignDoc = function(dbName, dDocConf, callback) {
        logger.debug(util.format('[Db.storeDesignDoc] IN (%s)', dbName));
        var localCallback = function(err, r){
            if(err)
                return callback(err);

            if(null != r){
                //lets update design doc
                dDocConf._rev = r._rev
            }
            var dbObj = connection.use(dbName);
            logger.info(util.format('[Db.storeDesignDoc] creating design doc: %s',JSON.stringify(dDocConf)));
            dbObj.insert(dDocConf, function(err){
                if (err)
                    callback(err);
                else
                    callback(null);
            });
        }

        getDesignDoc(dbName, localCallback);

        logger.debug('[Db.storeDesignDoc] OUT');
    };

    var scaffolding = function(connection, callback) {
        logger.debug('[Db.scaffolding] IN');

        var doneCounter = 0;

        var dbs = utils.getPropertyNames(config.database.instances);
        for(var i = 0; i < dbs.length; i++){
            var dbc = config.database.instances[dbs[i]];

            logger.info(util.format("[Db.scaffolding] going to create db %s", dbc.name));
            createDb(dbc.name, function(err){
                if(err){
                    logger.error(util.format('[Db.scaffolding] ...out of createDb... err: %s', JSON.stringify(err)));
                    if(callback)
                        callback(err);
                }
                logger.info('[Db.scaffolding] ...created db...');

                if(dbc.designDoc){
                    storeDesignDoc(dbc.name, dbc.designDoc, function(err){
                        if(err){
                            logger.error(util.format('[Db.scaffolding] ... out of storeDesignDoc... err: %s', JSON.stringify(err)));
                            throw err;
                        }
                        if( ++doneCounter == dbs.length){
                            if(callback)
                                callback(null);
                        }
                    });
                }
                else {
                    if( ++doneCounter == dbs.length){
                        if(callback)
                            callback(null);
                    }

                }

            });
        }

        logger.debug('[Db.scaffolding] OUT');
    };

    // ---------------------------------------------------------------------------
    // -----------------------------------PUBLIC METHODS--------------------------
    var isInitialized = function(){
        return initialized;
    };



    var init = function(callback) {
        logger.debug('[Db.init] IN');
        var credentials = resolveCredentials();
        logger.info(util.format("[Db.init] connecting with user %s", credentials.usr));
        var connectionOptions = {account:credentials.usr, password:credentials.pswd};
        logger.info('[Db.init] Connected to cloudant');
        initialized = true;
        connection = Cloudant(connectionOptions,
            function(err, connection, reply){
                if (err){
                    initialized = false;
                    console.log(err);
                    if(callback){
                        callback(err);
                    }
                }
                else {
                    logger.info(util.format('[Db.init] Connected to cloudant with username: %s', reply.userCtx.name));
                    scaffolding(connection, callback);
                }
            }
        );
        logger.debug('[Db.init] OUT');
    };

    var getAll  = function(db, callback, options) {
        logger.debug('[Db.getAll] IN');
        var dbObj = connection.use(db);

        var getAllCallback = function(cb){

            var f = function(err, r){
                if(err){
                    logger.error(err);
                    if(cb)
                        cb(err);
                }
                else {
                    var result = [];
                    r.rows.forEach(function(doc) {
                        if( 0 > doc.id.indexOf('_design'))
                            result.push(doc.doc);
                    });
                    logger.info(util.format("[Db.getAll] got %d docs", result.length));
                    if(cb)
                        cb(null, {ok: true, 'result': result})
                }
            };

            return { f: f };

        }(callback);

        if(options)
            dbObj.list(options, getAllCallback.f);
        else
            dbObj.list(getAllCallback.f);

        logger.debug('[Db.getAll] OUT');
    };

    var getAll2  = function(db, callback) {
        logger.debug('[Db.getAll2] IN');
        var dbObj = connection.use(db);

        var getAllCallback = function(cb){

            var f = function(err, r){
                if(err){
                    logger.error(err);
                    if(cb)
                        cb(err);
                }
                else {
                    var result = [];
                    r.rows.forEach(function(doc) {
                        if( 0 > doc.id.indexOf('_design'))
                            result.push(doc.doc);
                    });
                    logger.info(util.format("[Db.getAll2] got %d docs", result.length));
                    if(cb)
                        cb(null, {ok: true, 'result': result})
                }
            };

            return { f: f };

        }(callback);

        dbObj.list({"include_docs": true}, getAllCallback.f);
        logger.debug('[Db.getAll2] OUT');
    };

    var del = function(db, o, callback) {
        logger.debug('[Db.del] IN');
        var dbObj = connection.use(db);

        dbObj.destroy(o._id, o._rev,
            function(err){
                if(err){
                    logger.error(err);
                    if(callback)
                        callback(err);
                }
                else {
                    if(callback)
                        callback(null, 1);
                }
            }
        );
        logger.debug('[Db.del] OUT');
    };

    var deleteDb = function(name, callback) {
        logger.debug('[Db.deleteDb] IN');

        connection.db.destroy(name, function(err, o){
            if(err && (0 > err.message.indexOf("Database does not exist.")) ){
                logger.error(util.format("[Db.deleteDb] err:%s", JSON.stringify(err)));
                if(callback){
                    callback(err);
                }
            }
            else {
                var message = util.format("[Db.deleteDb] deleted db %s", name);
                logger.info(message);
                callback(null, {'ok':true, 'name':name, 'msg':message});
            }
        });
        logger.debug('[Db.deleteDb] OUT');
    };

    var delAll = function(db, callback) {
        logger.debug('[Db.delAll] IN');

        var getCallback = function(cb){

            var f = function(err, os){
                if(err){
                    logger.error(err);
                    if(cb)
                        cb(err);
                }
                else {
                    delBulk(db, os.result,
                        function(err,r) {
                            if(err){
                                logger.error(err);
                                if(callback)
                                    callback(err)
                            }
                            else {
                                callback(null, r);
                            }
                        }
                    );
                }
            };

            return {f:f};
        };

        getAll(db, getCallback(callback).f);

        logger.debug('[Db.delAll] OUT');
    };


    var delBulk = function(db, os, callback) {
        logger.debug('[Db.delBulk] IN');

        var dbObj = connection.use(db);
        var entries = [];
        for(var i=0; i < os.length; i++){
            var entry = {
                _id: os[i].id,
                _rev: os[i].value.rev,
                _deleted: true
            };
            entries.push(entry);
        }

        var docs = { "docs": entries };
        dbObj.bulk(docs, function(err, rows){
            if(err){
                logger.error(err);
                if(callback)
                    callback(err)
            }
            else {
                logger.info(util.format("[Db.delBulk] deleted %d docs",rows.length));
                if(callback)
                    callback(null, {ok: true, result:rows.length});
            }
        });

        logger.debug('[Db.delBulk] OUT');
    };

    var get = function(db, id, callback) {
        logger.debug('[Db.get] IN');
        var dbObj = connection.use(db);
        dbObj.get(id, { revs_info: true }, function(err, r) {
            if(err){
                logger.error(err);
                if(callback)
                    callback(err);
            }
            else {
                logger.info(util.format("[Db.get] got an item: %j",r));
                if(callback)
                    callback(null, r);
            }
        } );
        logger.debug('[Db.get] OUT');
    };

    var post = function(db, o, callback) {
        logger.debug('[Db.post] IN');
        var dbObj = connection.use(db);
        var _callback = null;

        if(Array.isArray(o)){
            var os = {"docs": o};
            _callback = function(o) {
                var objs = o;
                var f = function(err, r){
                    if(err){
                        logger.error(err);
                        if(callback)
                            callback(err);
                    }
                    else {
                        if(r.length != objs.length){
                            var er = new Error(util.format("object numbers don't match inserted %d != sent %d ", r.length, objs.length ));
                            logger.error(er);
                            if(callback)
                                callback(er);
                        }
                        else {
                            logger.info(util.format("[Db.post] inserted %d items", r.length));
                            for(var i=0; i<r.length; i++){
                                objs[i]._id = r[i].id;
                                objs[i]._rev = r[i].rev;
                            }
                            if(callback)
                                callback(null, objs);
                        }
                    }
                };
                return {f:f};
            }(o);
            dbObj.bulk(os, _callback.f);
        }
        else {
            _callback = function(o) {
                var obj = o;
                var f = function(err, r){
                    if(err){
                        logger.error(err);
                        if(callback)
                            callback(err);
                    }
                    else {
                        logger.info(util.format("[Db.post] inserted item with id %s", r.id));
                        obj._id = r.id;
                        obj._rev = r.rev;
                        if(callback)
                            callback(null, obj);
                    }
                };

                return {f:f};
            }(o);
            dbObj.insert(o, _callback.f);
        }

        logger.debug('[Db.post] OUT');
    };

    var setMessages = function(docs, callback){
        logger.debug('[persistence.setMessages] in');
        if(checkInitialization(setMessages, [ docs, callback ], callback) ) return;
        var o = {"docs": docs};
        cloudant_itsm[config.databases.slackmsg].bulk(o, function(err, result){
            if (err) {
                logger.error('[persistence.setMessages.callback] could not setMessages: %j', err);
                if(callback)
                    callback(err);
            }
            else {
                logger.debug('[persistence.setMessages.callback] saved the messages,result: %j', result);
                if(callback)
                    callback(null, {'ok': true});

            }
        });

        logger.debug('[persistence.setMessages] out');
    };

    var getSome  = function(db, options, callback, designDocsAlso) {
        logger.debug('[Db.getSome] IN');
        var dbObj = connection.use(db);

        var getAllCallback = function(cb){

            var f = function(err, r){
                if(err){
                    logger.error(err);
                    if(cb)
                        cb(err);
                }
                else {
                    var result = [];
                    if(designDocsAlso){
                        Array.prototype.push.apply(result, r.docs);
                    }
                    else {
                        r.docs.forEach(function(doc) {
                            if( 0 > doc._id.indexOf('_design'))
                                result.push(doc);
                        });
                    }
                    logger.info(util.format("got %d docs", result.length));
                    if(cb)
                        cb(null, result)
                }
            };

            return { f: f };

        }(callback);
        dbObj.find(options, getAllCallback.f);
        logger.debug('[Db.getSome] OUT');
    };

    var getView = function(db, view, options, callback) {
        logger.debug('[Db.getView] IN');
        var dbObj = connection.use(db);
        dbObj.view(db,view, options,
            function(err,body) {
                logger.debug('[Db.getView.callback] IN');
                if (!err) {
                    var results=[];
                    body.rows.forEach(
                        function(o) {
                            results.push(o);
                        }
                    );
                    callback(null,results);
                }
                else {
                    callback(err);
                }
                logger.debug('[Db.getView.callback] OUT');
            }
        );
        logger.debug('[Db.getView] OUT');
    };

    var getDbNames = function(callback) {
        logger.debug('[Db.getDbNames] IN');
        connection.db.list(function(err, body) {
            if(err){
                logger.error(err);
                if(callback)
                    callback(err);
            }
            else {
                var results=[];
                // body is an array
                body.forEach(function(db) {
                    results.push(db);
                });
                logger.debug(util.format("[Db.getDbNames] got %d dbs", results.length));
                if(callback)
                    callback(null, results);
            }
        });
        logger.debug('[Db.getDbNames] OUT');
    };

    var replicateDb = function(dbSrc, dbTarget, callback) {
        logger.debug('[Db.replicateDb] IN');

        connection.db.replicate(dbSrc, dbTarget, { create_target:true }, function(err, body) {
            if(err){
                logger.error(err);
                if(callback)
                    callback(err);
            }
            else {
                logger.debug(util.format("[Db.replicateDb] success %s", body.toString()));
                if(callback)
                    callback(null, body);
            }
        });

        logger.debug('[Db.replicateDb] OUT');
    };

    var numOf = function(dbName, callback){
        logger.debug('[Db.numOf] IN');

        var options = { reduce: true, group: false};
        getView(dbName, 'numOf', options,
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

        logger.debug('[Db.numOf] OUT');
    };


// ---------------------------------------------------------------------------

    return {
        isInitialized: isInitialized
        , init: init
        , getAll: getAll
        , del: del
        , deleteDb: deleteDb
        , delAll: delAll
        , delBulk: delBulk
        , get: get
        , post: post
        , getSome: getSome
        , getView: getView
        , getDbNames: getDbNames
        , replicateDb: replicateDb
        , numOf: numOf
    };

}();

module.exports = Db;