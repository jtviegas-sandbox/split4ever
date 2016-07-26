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
		for(dbName in dbMap)
			if(dbMap.hasOwnProperty(dbName))
				if(false == dbMap[dbName])
					dbs.push(dbName);

		if( 0 < dbs.length ){
			var stat= { create:dbs.length , created:0 };
			logger.info(util.format("must create %d dbs", stat.create));

			for(var i=0; i < dbs.length; i++){
				logger.info(util.format("must create db %s", dbs[i]));
				var creationCallback = function(name, map, counterStat, callback){
					var f = function(err, data){
						if(err){
							console.log(err);
							if(callback)
								callback(err);
							else 
								throw err;
						}
						else {
							map[name] = true;
							logger.info(util.format("created db %s", name));
							counterStat.created++;
							if(callback)
								if (counterStat.created == counterStat.create)
									callback(null, {ok:true});
						}	
						
					};
					return {f: f};
				};
				connection.db.create(dbs[i], 
					creationCallback(dbs[i], dbMap, stat, callBack).f);
			}
		}
		else {
			if(callBack)
				callBack(null, {ok:true});
		}
		
	};

	var initDatabases = function(dbs, connection, callback) {
		var existentDbMap = {};
		var cb = function(err, data){
			if(err){
				console.log(err);
				if(callback)
					callback(err);
			}
	    	logger.info(util.format("dbs in server: %s", data));
	    	if(data && 0<data.length)
	    		for(var i=0; i < data.length; i++)
	    			existentDbMap[data[i]] = true;
			logger.info(util.format("dbs we need: %s", dbs));
	    	for(var i=0; i<dbs.length; i++)
	    		if( ! existentDbMap[dbs[i]] )
	    			existentDbMap[dbs[i]]=false;
	    	
	    	logger.info(util.format("dbs map: %s", JSON.stringify(existentDbMap)));
	    	createDbs(existentDbMap, connection, callback);
		};
	    connection.db.list(cb);
	};

	//------------------public  methods

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

	var init = function(databases, callback) {
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
				DB_USR = config.app.db.user;
				DB_PSWD = config.app.db.pswd;
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
			   		initDatabases(databases, connection, callback);	
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
					logger.info(util.format("got %d docs", r.rows.length));
					if(cb)
						cb(null, {ok: true, result:r.rows})
				}	
			};

			return { f: f };

		}(callback);
			
		dbObj.list(getAllCallback.f);

		logger.trace('Model.getAll@');
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

	return { 
		init: init
		, post: post
		, deleteDb: deleteDb
		, createDb: createDb
		, getAll: getAll
		, get: get
		, delAll:delAll
		, delBulk: delBulk
		, del:del
	}; 


	

})();

module.exports = Model;

	