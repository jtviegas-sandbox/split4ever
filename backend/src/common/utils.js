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

	var logger = createLogger(config.app.name);
	

	return { 
		appLogger: logger
	};

}();

module.exports = Utils;