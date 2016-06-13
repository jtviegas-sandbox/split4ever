
var PragmaLogger = require('pragma-logger');

var Custom = function() {
	
	var createLogger = function(name) {
		return new PragmaLogger({
		    logger: {
		      charset: 'utf8',
		      levels: {
		        debug: './logs/%pid_debug_%y-%m-%d-%name.log',
		        error: './logs/%pid_error_%y-%m-%d-%name.log',
		        warn: './logs/%pid_warn_%y-%m-%d-%name.log',
		        trace: './logs/%pid_trace_%y-%m-%d-%name.log',
		        info: './logs/%pid_info_%y-%m-%d-%name.log'
		      },
		      messageFormat: '%t \t| %name :: %lvl \t| PID: %pid - %msg'
		    }
		}, name );
	};

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

	var randomString = function(len) {
		var o = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 5; i++ )
	        o += possible.charAt(Math.floor(random() * possible.length));

	    return o;
	};

	var createDummyItem = function(shouldItBeRandom){
		var o = {
				_id: null,
				images:[
				//'','',''...... objectIDs
				],
				name: '',
				notes: '',
				price: '',
				category:'', // {name: '....'}
				subCategory: '' // {name: '....', category:'....'}
			};

		if(shouldItBeRandom){
			o.name = randomString(12);
			o.notes = randomString(24);
			o.price = random(3,6);
			o.category = randomString(12);
			o.subCategory = randomString(12);
		}

		return o;
	};

	return { 
		areWeOnDocker: areWeOnDocker,
		areWeOnBluemix: areWeOnBluemix,
		getMongoConnectString: getMongoConnectString,
		doWeHaveServices: doWeHaveServices,
		sleep: sleep,
		createLogger: createLogger,
		log: log
		, createDummyItem: createDummyItem
		, randomString: randomString
		, random: random
	}; 

}();

module.exports = Custom;
