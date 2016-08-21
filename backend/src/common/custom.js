"use strict";

var PragmaLogger = require('pragma-logger');
var _ = require('underscore');

var Custom = function() {


	var areWeOnDocker = function() {
		console.log('@areWeOnDocker');
		var result = false;
		if(process.env.DOCKER == 'true')
			result = true;

		console.log('areWeOnDocker@[' + result + ']')
		return result;
	};

	var areWeOnBluemix = function() {
		console.log('@areWeOnBluemix');
		var result = false;
		if(process.env.CONTEXT == 'bluemix')
			result = true;

		console.log('areWeOnBluemix@[' + result + ']')
		return result;
	};

	var doWeHaveServices = function() {
		console.log('@doWeHaveServices');
		var result = false;
		if(process.env.VCAP_SERVICES)
			result = true;

		console.log('doWeHaveServices@[' + result + ']')
		return result;
	};

	var getMongoConnectString = function() {
		console.log('@getMongoConnectString');
		var result = '';
		console.log('VCAP SERVICES: ' + JSON.stringify(process.env.VCAP_SERVICES, null, 4));
		var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
		for (var svcName in vcapServices) {
		    if (svcName.match(/^mongo.*/)) {
		      result = vcapServices[svcName][0].credentials.uri;
		      //result = result || vcapServices[svcName][0].credentials.url;
		      break;
		    }
		}
		console.log('getMongoConnectString@[' + result + ']')
		return result;
	};

	var sleep = function(milliseconds) {
	  var start = new Date().getTime();
	  while((new Date().getTime() - start) < milliseconds);
	};

	var log = function(msg){
		console.log('[' + new Date().toString() + '] ' + msg);
	};

	var random = function(min, max) {
		var mi = 0;
		var ma = 1;
		if(min)
			mi=min;

		if(max)
			ma=max;

		return (Math.random() * (ma - mi)) + mi;
	};

	var randomBoolean = function(){
        return Math.random()<.5; 
    };

	var randomString = function(len) {
		var o = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 5; i++ )
	        o += possible.charAt(Math.floor(random() * possible.length));

	    return o;
	};

	var createDummyItem = function(shouldItBeRandom, id){
		var o = {
				images:[
				//'','',''...... objectIDs
				],
				name: '',
				notes: '',
				price: '',
				/*tags:[] // {name: '....'}*/
				category: ''
				, subCategory: ''
			};

		if(shouldItBeRandom){
			o.name = randomString(12);
			o.notes = randomString(24);
			o.price = random(3,6);
			o.category = randomString(12);
			o.subCategory = randomString(12);
			/*if(randomBoolean())
				o.tags.push( { "text": randomString(12) } );
			else
				o.tags.push( { "text": "abc" } );*/
		}
		if(id)
			o._id = id;

		return o;
	};

	var dummyItemEquals = function(a, b){
		
/*		if(!_.isEqual(a._id, b._id))
			return false;
		if(!_.isEqual(a._rev, b._rev))
			return false;*/
		if(!_.isEqual(a.images, b.images))
			return false;
		if(!_.isEqual(a.name, b.name))
			return false;
		if(!_.isEqual(a.notes, b.notes))
			return false;
		if(!_.isEqual(a.price, b.price))
			return false;
		if(!_.isEqual(a.category, b.category))
			return false;
		if(!_.isEqual(a.subCategory, b.subCategory))
			return false;


		return true;
	};

	return { 
		areWeOnDocker: areWeOnDocker,
		areWeOnBluemix: areWeOnBluemix,
		getMongoConnectString: getMongoConnectString,
		doWeHaveServices: doWeHaveServices,
		sleep: sleep,
		log: log
		, createDummyItem: createDummyItem
		, randomString: randomString
		, random: random
		, dummyItemEquals: dummyItemEquals
	}; 

}();

module.exports = Custom;
