var PragmaLogger = require('pragma-logger');
var config = require('./config.js');

var Utils = function() {

		
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

	var getPropertyNames = function(o){
		var r=[];
		for(var propName in o){
			if(o.hasOwnProperty(propName))
				r.push(propName);	
		}
		return r;
	}

	var getPropertyArray = function(o){
		var r=[];
		for(var propName in o){
			if(o.hasOwnProperty(propName))
				r.push(o[propName]);	
		}
		return r;
	}

	var logger = createLogger(config.app.name);
	

	return { 
		appLogger: logger
		, getPropertyNames: getPropertyNames
		, getPropertyArray: getPropertyArray
	};

}();

module.exports = Utils;