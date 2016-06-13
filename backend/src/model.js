//mongodb://username:password@hostname:port/database
var custom = require('./custom.js');
var mongolib = require('mongodb');
var ObjectID = mongolib.ObjectID;
var mongoClient = mongolib.MongoClient;
var util = require('util');
var assert = require('assert');


var Model = (function(){

	var DB_CONNECT_STRING = 'mongodb://localhost:27017/vwparts';
	var logger = custom.createLogger('model');
	var collectionMap = {};
	var connection = null;

	/*
		callback(err,connection)
	*/
	var getConnection = function(callback){

		if(null === connection){
			
			var createCallback = function(err, db){
				if(null != err)
					callback(err, null);
				else {
					connection = db;
					logger.info('connected to mongo');
					callback(null, connection);
				}
			};

			var connectionString = DB_CONNECT_STRING;
			if(process.env.DB_CONN_STR)
					connectionString = process.env.DB_CONN_STR;

			if(custom.areWeOnBluemix() && custom.doWeHaveServices()){
				connectionString = custom.getMongoConnectString();
				if(custom.areWeOnDocker()){
					logger.info('...waiting for bluemix network to pop up...');
					custom.sleep(120000);
					logger.info('...resuming now');	
				}
			};
			logger.trace(util.format('going to connect to %s', connectionString));
			mongoClient.connect(connectionString, createCallback);
		}
		else
			callback(null, connection);
	};

	/*
		callback(err,collection)
	*/
	var getCollection = function(collectionName, callback){

		var createCallback = function(err, conn){
			if(null != err)
				callback(err, null);
			else {
				conn.createCollection(collectionName, {}, 
					function(e,c){
						if(null != e){
							logger.trace(util.format('@getCollection#createCallback e is not null %s', e));
							if(null != callback)
								callback(e, null);
						}
						else{
							logger.trace(util.format('@getCollection#createCallback e is null and c type is: %s', typeof c));
							collectionMap[collectionName] = c;
							logger.info('...created collection: ' + collectionName);
							if(null != callback)
								callback(null, c);
						}
						logger.info(util.format('collection map has now %d elements', Object.keys(collectionMap).length));
					}
				);	
			}
			
		};

		if(null != collectionMap[collectionName]){
			logger.trace(util.format('@getCollection#createCallback found collection in map and its type is: %s', typeof (collectionMap[collectionName]) ) );
			callback(null,collectionMap[collectionName]);
		}
		else {
			logger.trace('...not in map, have to find connection...');
			getConnection(createCallback);
		}
			

	};

	/*
		callback(err, result: { ok: 1, obj: c)
	*/
	var findCollection = function(collectionName, callback){

		var getConnCallback = function(colN, cb){

			var colName = colN;
			var cback = cb;

			var f = function(err, conn){
				if(null != err){
					logger.trace(util.format('@findCollection#findCallback...err is not null: %s.', err));
					if(null != cback)
						cback(err, null);
				}
				else {
					conn.collection( colName, { "strict": false },  
						function(e, c){
							if(null != e){
								logger.trace(util.format('@findCollection#findCallback...e is not null: %s.', e));
								if(null != cback)
									cback(e, null);
							}
							else{
								logger.trace('@findCollection#findCallback...e is null.');
								if(null != cback){
									if(null !== c){
										logger.trace('@findCollection#findCallback...c is not null.');
										cback(null, { "ok": 1, "obj": c });
									}
									else{
										logger.trace('@findCollection#findCallback...c is null.');
										cback(null, { "ok": 0, "obj": null });
									}
								}
							}
						}
					);	
				}
			};

			return { f: f};

		}(collectionName, callback);

		getConnection(getConnCallback.f);

	};

	/*
		callback(err, result : { ok: 1|0})
	*/
	var delCollection = function(collectionName, callback){

		var findCallback = function(err, r){
			if(null != err){
				logger.trace(util.format('could not drop collection %s', collectionName));
				if(null != callback)
					callback(err, null);
			}
			else {
				if( 1 === r.ok ) {
					var coll = r.obj;
					coll.drop(function(err, r){
						if(null != err){
							logger.warn(util.format('could not drop collection %s', collectionName));
							if(null != callback)
								callback(err, null);
						}
						else {
							delete collectionMap[collectionName];
							logger.info(util.format('dropped collection %s', collectionName));
							callback(null, { "ok": 1 });			
						}
					});	
				}
				else {
					logger.warn(util.format('did not find collection %s', collectionName));
					callback(null, { "ok": 1 });
				}
					
			}
		};

		findCollection(collectionName, findCallback);

	};

	/*
		callback(err,connection)
	*/
	var getAll  = function(collectionName, callback) {

		logger.trace('@Model.getAll');

		var getAllCallback = function(cback){
			var cb = cback;
			var f = function(err, collection){
				if(null != err){
					logger.trace(util.format('@getAll#getAllCallback err is not null %s', err));
					if(null != cb)
						cb(err, null);
				}
				else {
					logger.trace(util.format('@getAll#getAllCallback err is null'));
					var cursor = collection.find();
					var result = [];
					cursor.each(function(e, item) {
						if (null != e) {
				  			if(null != cb)
								cb(e, null);
						}
						else{
							if (item != null) 
					    		result.push(item);
					    	else {
					    		if(null != cb)
					    			cb(null,result);	
					    	}
						}			 
				   	});
				}

			};

			return { f: f };

		}(callback);
			
		
		getCollection(collectionName, getAllCallback.f);

		logger.trace('Model.getAll@');
	};

	/*
		callback(err, result: { ok: 1, n: <num deleted> })
	*/
	var delAll = function(collectionName, callback) {

		logger.trace('@Model.delAll');
		
		var delCallback = function(err, collection){
			if(null != err) {
				logger.trace(util.format('@delCallback...err is not null: %s.', err));
				if(null != callback)
					callback(err, null);
			}
			else {
				collection.deleteMany({}, null, function(e, r){
					if(null != e){
						logger.trace(util.format('@delCallback#collection.deleteMany...e is not null: %s.', e));
						if(null != callback)
							callback(e, null);
					}	
					else {
						logger.trace(util.format('@delCallback#collection.deleteMany...e is null and we have r: %s.', JSON.stringify(r)));
						logger.trace(typeof r)
						callback(null, JSON.parse(r));
					}
					
				});
				
			}
		};

		if(collectionMap[collectionName]){
			delCallback(null,collectionMap[collectionName]);
		}
		else 
			getCollection(collectionName, delCallback);
		
		logger.trace('Model.delAll@');		
	};

	/*
		returns  id or err

	*/
	var post = function(collectionName, o, callback) {

		logger.trace('@Model.post');
		
		var id = new ObjectID();
		var update= false;

		if(! o._id ) {
			id = new ObjectID();
			o._id = id;
		}
		else {			
			id = new ObjectID(o._id);
			o._id = id;
			update= true;
		}

		var postCallback = function(err, col) {
			if(null != err) {
				logger.trace(util.format('@postCallback...err is not null: %s.', err));
				if(null != callback)
					callback(err, null);
			}
			else {
				if(! update ) {
					logger.debug('going to insert');
					col.insertOne(o, function(err, r){
						if(null != err) {
							if(null != callback)
								callback(err);
						}
						else {
							o = r.result;
							if( o.ok == 1 ){
							  	logger.info(util.format('inserted %d element(s) in collection %s', o.n, collectionName));
						  		if(null != callback)
									callback(err, id);
							}
						  	else {
						  		logger.info(util.format('result %d when inserting elements in collection %s', o.ok, collectionName));
						  		if(null != callback)
						  			callback(new Error('insert was not ok'));
						  	}
						}
					} );
				}
				else {			
					logger.debug('going to replace');
					var query = { _id: id};
					if("string" == typeof id)
						query._id =  new ObjectID(id);
					col.replaceOne( query, o, function(err, r){
						if(null != err) {
							if(null != callback)
								callback(err);
						}
						else {
							o = r.result;
							if( o.ok == 1 ){
							  	logger.info(util.format('replaced %d element(s) in collection %s', o.n, collectionName));
						  		if(null != callback)
									callback(err, id);
							}
						  	else {
						  		logger.info(util.format('result %d when replacing elements in collection %s', o.ok, collectionName));
						  		if(null != callback)
						  			callback(new Error('replace was not ok'));
						  	}
						}
					}  );
				}

				
			}
		};

		if(collectionMap[collectionName]){
			postCallback(null,collectionMap[collectionName]);
		}
		else 
			getCollection(collectionName, postCallback);

		logger.trace('Model.post@');
	};

	var del = function(collectionName, id, callback) {

		logger.trace('@Model.del');

		var delCallback = function(err, col) {
			if(null != err) {
				logger.trace(util.format('@postCallback...err is not null: %s.', err));
				if(null != callback)
					callback(err, null);
			}
			else {
				var query = { _id: id};
				if("string" == typeof id)
					query._id =  new ObjectID(id);
				col.deleteOne(query , function(err, r){
					if(null != err) {
						if(null != callback)
							callback(err);
					}
					else {
						o = r.result;
						if( o.ok == 1 ){
						  	logger.info(util.format('deleted %d element(s) in collection %s', o.n, collectionName));
					  		if(null != callback)
								callback(err, o.n);
						}
					  	else {
					  		logger.info(util.format('result %d when deleting element in collection %s', o.ok, collectionName));
					  		if(null != callback)
					  			callback(new Error('delete was not ok'));
					  	}
					}
				} );
			}
		};

		if(collectionMap[collectionName]){
			delCallback(null,collectionMap[collectionName]);
		}
		else 
			getCollection(collectionName, delCallback);

		logger.trace('Model.del@');
	};

	var get = function(collectionName, id, callback) {

		logger.trace('@Model.get');

		var getCallback = function(err, col) {
			if(null != err) {
				logger.trace(util.format('@getCallback...err is not null: %s.', err));
				if(null != callback)
					callback(err, null);
			}
			else {
				var query = { _id: id};
				if("string" == typeof id)
					query._id =  new ObjectID(id);

				logger.trace(util.format('@getCallback...going to try to find id: %s which is type', id, typeof id));
				//logger.trace(util.format('@getCallback...col: %s', util.inspect(col)));
				col.findOne( query ,  function(err, r){
					if(null != err) {
						if(null != callback)
							callback(err);
					}
					else {
						if(null != r){
						  	logger.info(util.format('got %s element in collection %s', JSON.stringify(r), collectionName));
					  		if(null != callback)
								callback(null, r);
						}
					  	else {
					  		logger.info(util.format('no result when getting element in collection %s', collectionName));
					  		if(null != callback)
					  			callback(new Error('get was not ok'));
					  	}
					}
				} );
			}
		};

		if(null != collectionMap[collectionName]){
			getCallback(null,collectionMap[collectionName]);
		}
		else 
			getCollection(collectionName, getCallback);

		logger.trace('Model.get@');
	};

	return { 
		getAll: getAll
		, delAll: delAll
		, post: post
		, delCollection: delCollection
		, del: del
		, get: get
		/*
		,getCollection: getCollection
		,post2Collection: post2Collection
		, get: get
		*/
	}; 

}());

module.exports = Model;

	