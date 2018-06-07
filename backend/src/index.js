var express = require('express');
var util = require('util');
var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');

//custom modules
var parts = require('./resources/parts/route.js');
var logger = require('./services/common/apputils').logger;

//CONSTANTS
process.env.PORT = process.env.PORT || 3000;
process.env.MODE = process.env.MODE || 'PROD';
process.env.STORE = process.env.STORE || 'REAL';

var frontendDir = __dirname + '/public';

logger.info('[index.js] starting in mode: %s [frontend dir: %s]', process.env.MODE, frontendDir);

var cookieSessionProps = {
  name: 'session',
  keys: ['split4ever', 'split4ever, ever'],
  cookie: {
	  // 30 days cookies
    maxAge : 30*24*60*60*1000
  }
};


var app = express();
app.use(cookieSession(cookieSessionProps));
app.use(cookieParser());
app.set('port', process.env.PORT);

var options = {
  dotfiles: 'ignore',
  etag: false,
   extensions: ['png', 'html'],
  //index: false,
  redirect: false
};

app.use('/', express.static(frontendDir, options));
app.use('/api/parts', parts);

// custom 404 page
app.use(function(req, res){
	logger.info(util.format('reached 404'));
	res.type('text/plain');
	res.status(404);
	res.send('404 - Not Found');
});

// custom 500 page
app.use(function(err, req, res, next){
	logger.error(util.format('reached 500: %s', err.stack));
	res.type('text/plain');
	res.status(500);
	res.send('500 - Server Error');
});

app.listen(app.get('port'), function() {
  logger.info(util.format('split4ever started on http://localhost:%s', app.get('port')));
});

module.exports = app;
