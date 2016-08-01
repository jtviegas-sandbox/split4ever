var custom = require('./custom.js');
var Cloudant = require('cloudant');
var util = require('util');
var assert = require('assert');
var logger = require('./utils').appLogger;
var config = require('./config');

var Model = (function(){

	var DB_USR = null;
	var DB_PSWD = null;
	var connection = null;

	//------------------private methods
	var createDbs = function(dbMap, connection, callBack){
		
		var dbs = [];
		for(db in dbMap)
			if(dbMap.hasOwnProperty(db))
				if(false == dbMap[db].exists)
					dbs.push(dbMap[db].config);

		if( 0 < dbs.length ){
			var stat= { create:dbs.length , created:0 };
			logger.info(util.format("must create %d dbs", stat.create));

			for(var i=0; i < dbs.length; i++){
				logger.info(util.format("must create db %s", dbs[i].name));

				var creationCallback = function(dbconf, map, counterStat, callback){
					var f = function(err, data){
						if(err){
							logger.error(JSON.stringify(err));
							throw err;
						}
						else {
							map[dbconf.name].exists = true;
							logger.info(util.format("created db %s", dbconf.name));
							if(dbconf.views && Array.isArray(dbconf.views)){
								for(var i = 0; i < dbconf.views.length; i++){
									var view = dbconf.views[i];

									createView(dbconf.name, view.name, view.map, function(err){
										if(err){
											logger.error(JSON.stringify(err));
											throw err;
										}
										else{
											logger.info(util.format("created view %s in db %s", view.name, dbconf.name));
											if(callBack)
												callback(null, {ok:true});
										}
									});
								}
							}
			
						}	
						
					};
					return {f: f};
				};

				connection.db.create(dbs[i].name, 
					creationCallback(dbs[i], dbMap, stat, callBack).f);
			}
		}
		else {
			if(callBack)
				callBack(null, {ok:true});
		}
		
	};

	

	//------------------public  methods

	var scaffolding = function(dbConf, callback) {

		var existentDbMap = {};
		var cb = function(err, data){

			if(err){
				logger.error(err);
				throw err;
			}
	    	logger.info(util.format("dbs in server: %s", data));

	    	if(data && 0<data.length){
	    		for( var i=0; i < data.length; i++ ){
	    			logger.info(util.format("existent db: %s", data[i]));
	    			existentDbMap[data[i]] = { 'exists': true };
	    		}
	    	}
	    	console.log(JSON.stringify(dbConf));
	    	for(var i=0; i<dbConf.instances.length; i++){
	    		logger.info(util.format("we need db: %s", dbConf.instances[i].name));
	    		if( ! existentDbMap[dbConf.instances[i].name] )
	    			existentDbMap[dbConf.instances[i].name] = { 'exists': false , 'config' : dbConf.instances[i] };
	    	}
	    	logger.info(util.format("dbs map: %s", JSON.stringify(existentDbMap)));

	    	createDbs(existentDbMap, connection, callback);
		};
	    connection.db.list(cb);
	};

	var createDb = function(name, callback){
		connection.db.create(name,function(err, o){
			if(err){
				logger.error(err);
				if(callback)
					callback(err);
			}
			else {
				var message = util.format("created db %s", name);
				logger.info(message);
				callback(null, {ok:true, name:name, msg:message});
			}
		});
	};

	var init = function(dbConf, callback) {
		logger.trace('@Model.init');
		if (process.env.VCAP_SERVICES) {
			var services = JSON.parse(process.env.VCAP_SERVICES);
			var cloudant_info = services.cloudantNoSQLDB[0];
			DB_USR = cloudant_info.credentials.username;
			DB_PSWD = cloudant_info.credentials.password;
		}
		else {
			if(process.env.DB_USR && process.env.DB_PSWD){
				DB_USR = process.env.DB_USR;
				DB_PSWD = process.env.DB_PSWD;
			}
			else {
				DB_USR = dbConf.credentials.user;
				DB_PSWD = dbConf.credentials.pswd;
			}
		}

		logger.info(util.format("connecting with user %s", DB_USR));
		var connectionOptions = {account:DB_USR, password:DB_PSWD};

		connection = Cloudant(connectionOptions, 
			function(err, connection, reply){
				if (err){
					console.log(err);
					if(callback)
						callback(err);
				}
				else {
					logger.info(util.format('Connected to cloudant with username: %s', reply.userCtx.name));	
					if(callback)
						callback(null);
				}
			}
		);
		logger.trace('Model.init@');
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

	var getSome  = function(db, options, callback) {

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
					r.docs.forEach(function(doc) {
				      if( 0 > doc._id.indexOf('_design'))
				      	result.push(doc);
				    });
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
		connection.db.destroy(name, function(err, o){
				if(err){
					logger.error(err);
				if(callback)
					callback(err);
				}
				else {
					var message = util.format("deleted db %s", name);
					logger.info(message);
					callback(null, {ok:true, name:name, msg:message});
				}
			});
	};


	var createView = function(dbName, viewName, mapFunctionStr, callback) {
		var dbObj = connection.use(dbName);

		var viewConf ={
	      "_id": "_design/" + dbName,
	        "language": "javascript",
	      "views": {
	      	"datasource" : { "map": mapFunctionStr }
	      } 
	  	};
		console.log('creating view: %s',JSON.stringify(viewConf));
	    dbObj.insert(viewConf, function(err,result){
		      if (err) 
		        callback(err); 
		      else 
		        callback(null);
	    });
	};

	var readView = function(dbName, viewName, options, callback){
		logger.debug('[Model.readView] in');
		var dbObj = connection.use(dbName);

		dbObj.view(dbName, viewName, options,
		    function(err,body) {
		    	console.log('body: %s', JSON.stringify(body));
				if (!err) {
				    var results=[];
				    body.rows.forEach(
				    	function(doc) {
							results.push(doc.value);
					    }
					);
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
		, scaffolding: scaffolding
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
	}; 

})();

module.exports = Model;

	