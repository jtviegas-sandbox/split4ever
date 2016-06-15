
var expect = require('chai').expect;
var assert = require('chai').assert;
var fail = require('chai').fail;
var util = require('util');
var model = require('../dist/common/model.js');
var custom = require('../dist/common/custom.js');
var logger = custom.createLogger('tests');

var TEST_DB = 'unittests';
var numOfDummyItems = 10;
var dummyItems = [];

describe('model test - items', function() {

	for(var i=0; i<numOfDummyItems; i++)
		dummyItems.push(custom.createDummyItem(true));

	before(function(done) {
	    // runs before all tests in this block
	    logger.info('-------------- before tests --------------');
	    model.init([ TEST_DB ], function(err, o){
	    	if(err)
	    		throw err;

	    	model.delAll(TEST_DB, function(err, o){
	    		if(err)
	    			throw err;
	    		logger.info('------------------------------------------');
	    		done();
	    	});
	    });

	});

	after(function(done) {
		// runs after all tests in this block
		logger.info('-------------- after tests ---------------');
	    model.deleteDb(TEST_DB, function(){
	    	logger.info('------------------------------------------');
	    	done();
	    });
	    
  	});

	describe('#getAll()', function(){
	    it('should return an array of 0 elements for collection is empty', 
	    	function(done){
		    	var callback = function(err, o){
		    		if(err){
		    			logger.error(err);	
		    			fail(err, null);
						done();
		    		}
		    		else {
						assert.typeOf(o.result, 'array');
						assert.lengthOf(o.result,0);
						done();
		    		}
				};
				model.getAll(TEST_DB, callback);
		});
	});

	describe('#post()', function(){
		
	    it('should return a new Id when we are inserting in an empty collection', function(done){
			var item = dummyItems[0];

	    	var callback = function(err, r){
	    		if(err){
	    			console.log(err);
	    			fail(err, null);	
					done();

	    		}
	    		else {
	    			logger.info(util.format('ok: %s', JSON.stringify(r)));
					expect(r.result).to.not.be.null;
					expect(r.result._id).to.not.be.null;
					expect(r.result._rev).to.not.be.null;
					dummyItems[0] = r.result;
					done();
	    		}
			};
			console.log("going to insert item: %s", JSON.stringify(item));
			model.post(TEST_DB, item, callback);
		});

		it('should return the same Id when we are inserting the same object', function(done){
			var item = dummyItems[0];
	    	var callback = function(err, r){
	    		if(err){
	    			console.log(err);
	    			fail(err, null);	
					done();
	    		}
	    		else {
	    			logger.info(util.format('ok: %s', JSON.stringify(r)));
					assert.equal(item._id, r.result._id);
					assert.isTrue(custom.dummyItemEquals(r.result, item));
					dummyItems[0] = r.result;
					done();
	    		}
			};
			console.log("going to update item: %s", JSON.stringify(item));
			model.post(TEST_DB, item, callback);

		});

		
	    it('should return a new Id when we are inserting a new item', function(done){

	    	var item = dummyItems[1];
	    	var callback = function(err, r){
	    		if(err){
	    			console.log(err);
	    			fail(err, null);	
					done();
	    		}
	    		else {
	    			logger.info(util.format('ok: %s', JSON.stringify(r)));
	    			assert.isTrue(custom.dummyItemEquals(r.result, item));
	    			dummyItems[1] = r.result;
					done();
	    		}
			};
			model.post(TEST_DB, item, callback);
		});

	    it('should return an array of 2 elements after 2 inserts', 
	    	function(done){
		    	var callback = function(err, o){
		    		if(err){
		    			logger.error(err);	
		    			fail(err, null);
						done();
		    		}
		    		else {
						assert.typeOf(o.result, 'array');
						assert.lengthOf(o.result,2);
						done();
		    		}
				};
				model.getAll(TEST_DB, callback);
		});


	});

	//get by id
	describe('#get()', function(){
		var item = dummyItems[1];
	    it('should get one element', 
	    	function(done){
		    	var callback = function(err, o){
		    		if(err){
		    			logger.error(err);	
						done();
		    		}
		    		else {
						assert.isTrue(custom.dummyItemEquals(o.result, item));
						done();
		    		}
				};
				logger.info(util.format('going to get id: ', item._id));
			model.get(TEST_DB, item._id, callback);
		});


	});	

	//delete

	describe('#del()', function(){
		var item = dummyItems[1];
	    it('should delete one element', 
	    	function(done){
		    	var callback = function(err, o){
		    		if(err){
		    			logger.error(err);	
						done();
		    		}
		    		else {
						assert.equal(o.result, 1);
						done();
		    		}
				};
			model.del(TEST_DB, item, callback);
		});

	    it('should return an array of 1 element after two inserts and one update and one delete', function(done){
	    	var callback = function(err, r){
	    		if(err) {
	    			logger.error(err);	
					done();
	    		}
	    		else {
	    			logger.info(util.format('ok: ', JSON.stringify(r)));
					assert.typeOf(r.result, 'array');
					assert.lengthOf(r.result,1);
					done();
	    		}
			};
			model.getAll(TEST_DB, callback);
		});

	});

});

