var custom = require('./custom.js');
var Cloudant = require('cloudant');
var util = require('util');
var assert = require('assert');
var logger = require('./utils').appLogger;
var utils = require('./utils');
var config = require('./config');

var Model = (function(){

	var DB_USR = null;
	var DB_PSWD = null;
	var connection = null;

	var scaffolding = function(dbConf, callback) {
		logger.trace('[Model.scaffolding] IN');

		var doneCounter = 0;

		for(var i = 0; i < dbConf.instances.length; i++){
			var dbc = dbConf.instances[i];
			logger.info(util.format("going to create db %s", dbc.name));
			createDb(dbc, function(err, r){
				if(err){
					logger.error(util.format('[Model.scaffolding] ...out of createDb2... err: %s', JSON.stringify(err)));
					if(callback)
						callback(err);
				}
				logger.info('[Model.scaffolding] ...out of createDb...');
				if(dbc.designDoc){
					storeDesignDoc(dbc.designDoc, function(err, r){
						if(err){
							logger.error(util.format('[Model.scaffolding] ... out of storeDesignDoc... err: %s', JSON.stringify(err)));
							throw err;
						}
						if( ++doneCounter == dbConf.instances.length){
							if(callback)
								callback(null);
						}
					});
				}
				else {
					if( ++doneCounter == dbConf.instances.length)
						if(callback)
							callback(null);
				}

			});
		}

	    logger.trace('[Model.scaffolding] OUT');
	};

	

	var init = function(dbConf, callback) {
		logger.trace('@Model.init');
		if (process.env.VCAP_SERVICES) {
			var services = JSON.parse(process.env.VCAP_SERVICES);
			var cloudant_info = services.cloudantNoSQLDB[0];
			DB_USR = cloudant_info.credentials.username;
			DB_PSWD = cloudant_info.credentials.password;
			logger.info("[Model.init] got credentials from vcap env var");
		}
		else {
			if(process.env.DB_USR && process.env.DB_PSWD){
				DB_USR = process.env.DB_USR;
				DB_PSWD = process.env.DB_PSWD;
				logger.info("[Model.init] got credentials from env vars");
			}
			else {
				DB_USR = dbConf.credentials.user;
				DB_PSWD = dbConf.credentials.pswd;
				logger.info("[Model.init] got credentials from config");
			}
		}

		logger.info(util.format("connecting with user %s", DB_USR));
		var connectionOptions = {account:DB_USR, password:DB_PSWD};
		logger.info('Connected to cloudant');
		connection = Cloudant(connectionOptions, 
			function(err, connection, reply){
				if (err){
					console.log(err);
					if(callback){
						callback(err);
					}
				}
				else {
					logger.info(util.format('Connected to cloudant with username: %s', reply.userCtx.name));	
					if(callback){
						callback(null);
					}
				}
			}
		);
		logger.trace('Model.init@');
	};

	var createDb = function(conf, callback){
		logger.trace('[Model.createDb] IN');
		//console.log('cnx: %s', JSON.stringify(connection));
		connection.db.create(conf.name,function(err, o){
			if(err && err.message != "The database could not be created, the file already exists."){
				logger.error(util.format("[Model.createDb] err: %s", err.message));
				if(callback){
					callback(err);
				}
			}
			else {
				logger.info(util.format("[Model.createDb] created db %s", conf.name));
				if(callback){
					callback(null);
				}
			}
		});
		logger.trace('[Model.createDb] OUT');
	};

	var post = function(db, o, callback) {

		logger.trace('@Model.post');
		var dbObj = connection.use(db);

		var postCallback = function(o) {
			var obj = o;
			var f = function(err, r){
				if(err){
					logger.error(err);
					if(callback)
						callback(err);
				}
				else {
					obj._id = r.id;
					obj._rev = r.rev;
					if(callback)
						callback(null, {ok: true, result: obj});
				}
			};

			return {f:f};
		}(o);

		dbObj.insert(o, postCallback.f);

		logger.trace('Model.post@');
	};



	var get = function(db, id, callback) {

		logger.trace('@Model.get');
		var dbObj = connection.use(db);
		dbObj.get(id, { revs_info: true }, function(err, r) {
				if(err){
					logger.error(err);
					if(callback)
						callback(err);
				}
				else {
					logger.info(util.format("got an item: %j",r));
					if(callback)
						callback(null, {ok: true, result:r});
				}
		} );

		logger.trace('Model.get@');
	};

	var delBulk = function(db, os, callback) {
		logger.trace('@Model.delBulk');

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
				logger.info(util.format("deleted %d docs",rows.length));
				if(callback)
					callback(null, {ok: true, result:rows.length});	
			}
		});

		logger.trace('Model.delBulk@');
	}



	var delAll = function(db, callback) {

		logger.trace('@Model.delAll');

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

		logger.trace('Model.delAll@');		
	};

	var del = function(db, o, callback) {

		logger.trace('@Model.del');
		var dbObj = connection.use(db);

		var delCallback = function(o) {
			var obj = o;
			var f = function(err, r){
				if(err){
					logger.error(err);
					if(callback)
						callback(err);
				}
				else {
					if(callback)
						callback(null, {ok: true, result:1});
				}
			};
			return {f:f};
		}(o);

		dbObj.destroy(o._id, o._rev, delCallback.f);

		logger.trace('Model.del@');
	};

	var getAll  = function(db, callback) {

		logger.trace('@Model.getAll');
		var dbObj = connection.use(db);

		var getAllCallback = function(cb){

			var f = function(err, r){
				if(err){
					logger.error(err);
					if(cb)
						cb(err);
				}
				else {
					console.log('GOT %s', JSON.stringify(r));
					var result = [];
					r.rows.forEach(function(doc) {
				      if( 0 > doc.id.indexOf('_design'))
				      	result.push(doc);
				    });
					logger.info(util.format("got %d docs", result.length));
					if(cb)
						cb(null, {ok: true, 'result':result})
				}	
			};

			return { f: f };

		}(callback);

		dbObj.list(getAllCallback.f);

		logger.trace('Model.getAll@');
	};

	var getViews = function(db, callback){
		logger.trace('[Model.getViews] IN');
		var localCallback = function(err, result){

			if(err){
				callback(err);
			}
			else {
				var o = [];
				if(0 < result.length){
					
					var r = result[0];

					if(r.views){
						Array.prototype.push.apply(o, utils.getPropertyArray(r.views));
					}
				}

				logger.trace(util.format('[Model.getViews] result: %s', JSON.stringify(o)));
				callback(null, o);
			}
		};
		var options =  { 
				'selector': 
					{ '_id': 
						{ '$eq': '_design/' + db } 
					}
			, 'sort': [ { '_id': 'asc' } ] 
		};
		getSome(db, options, localCallback, true);
		logger.trace('[Model.getViews] OUT');
	};

	var getDesignDoc = function(db, callback){
		logger.trace('@Model.getDesignDoc');
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
		logger.trace('@Model.getDesignDoc');
	};

	var getSome  = function(db, options, callback, designDocsAlso) {

		logger.trace('@Model.getSome');
		var dbObj = connection.use(db);

		var getAllCallback = function(cb){

			var f = function(err, r){
				if(err){
					logger.error(err);
					if(cb)
						cb(err);
				}
				else {
					//console.log('GOT %s', JSON.stringify(r));
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

		logger.trace('Model.getSome@');
	};

	var deleteDb = function(name, callback) {
		logger.debug('[Model.deleteDb] in');

		connection.db.destroy(name, function(err, o){
			if(err && err.message != "Database does not exist."){
				logger.error(util.format("[Model.deleteDb] err:%s", JSON.stringify(err)));
				if(callback){
					callback(err);
				}
			}
			else {
				var message = util.format("[Model.deleteDb] deleted db %s", name);
				logger.info(message);
				callback(null, {'ok':true, 'name':name, 'msg':message});
			}
		});
		logger.debug('[Model.deleteDb] out');
	};


	var createView = function(dbName, viewName, mapFunctionStr, reduceFunctionStr, callback) {

		logger.debug('[Model.createView] IN');
		var localCallback = function(err, r){
			if(err)
				return callback(err);

			if(null == r){
				//lets create design doc
				r = {
			      "_id": "_design/" + dbName
			      , "language": "javascript"
			      , "views": {} 
			  	};
			}

			r.views[viewName] = {};
		  	r.views[viewName]["map"] = mapFunctionStr;
		  	if(reduceFunctionStr){
		  		r.views[viewName]["reduce"] = reduceFunctionStr;
		  	}
		  	storeDesignDoc(r, callback);
		}

		getDesignDoc(dbName, localCallback);

		logger.debug('[Model.createView] OUT');
	};

	/*
		we create one design doc per document db
	*/
	var storeDesignDoc = function(conf, callback) {
		logger.debug('[Model.storeDesignDoc] IN');

		var dbName = conf._id.substring('_design/'.length);
		logger.info(util.format("going to store design doc in db %s", dbName));

		var localCallback = function(err, r){
			if(err)
				return callback(err);

			if(null != r){
				//lets update design doc
				conf._rev = r._rev
			}
			var dbObj = connection.use(dbName);
			logger.info(util.format('creating design doc: %s',JSON.stringify(conf)));
		    dbObj.insert(conf, function(err,result){
			      if (err) 
			        callback(err); 
			      else 
			        callback(null);
		    });
		}

		getDesignDoc(dbName, localCallback);

		logger.debug('[Model.storeDesignDoc] OUT');
	};

	var readView = function(dbName, viewName, options, callback){
		logger.debug('[Model.readView] in');
		var dbObj = connection.use(dbName);

		dbObj.view(dbName, viewName, options,
		    function(err,body) {
		    	console.log('body: %s', JSON.stringify(body));
				if (!err) {
				    var results=[];
				    if(body.rows && Array.isArray(body.rows) && 0 < body.rows.length){
				    	Array.prototype.push.apply(results, body.rows);
				    }
					console.log('results: %s', JSON.stringify(results));
				    callback(null,results);
				} 
				else {
					logger.debug('[Model.readView.callback] err');
				    callback(err);
				}
				logger.debug('[Model.readView] done');
		   }
		);
		logger.debug('[Model.readView] out');
	};

	return { 
		init: init
		, post: post
		, deleteDb: deleteDb
		, createDb: createDb
		, getAll: getAll
		, get: get
		, delAll:delAll
		, delBulk: delBulk
		, del: del
		, createView: createView
		, readView: readView
		, getSome: getSome
		, getViews: getViews
		, getDesignDoc: getDesignDoc
		, storeDesignDoc: storeDesignDoc
		, scaffolding: scaffolding
	}; 

})();

module.exports = Model;

	