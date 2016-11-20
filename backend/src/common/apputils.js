"use strict";

var config = require('./config.js');
var winston = require('winston');
var AppUtils = function() {

//default levels: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
	var logger = new(winston.Logger)({
		transports: [
			new(winston.transports.Console)({
				level: config.log.level,
				colorize: false,
				'timestamp': true
			})
			, new(winston.transports.File)({
				filename: config.log.filename,
				level: config.log.level,
				timestamp: true,
				json: false,
				maxsize: config.log.filesize,
				maxFiles: config.log.filenum,
				prettyPrint: true,
				colorize: false
			})
		]
	});

	return { 
		logger: logger
	};

}();

module.exports = AppUtils;