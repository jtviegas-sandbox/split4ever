var express = require('express');
var util = require('util');
var favicon = require('serve-favicon');
var cookieSession = require('cookie-session');
var uuid = require('uuid');
var cookieParser = require('cookie-parser');
var logger = require('./common/utils').appLogger;

//CONSTANTS
var PORT=3000;
var BODY_MAX_SIZE = '10240kb';

var cookieSessionProps = {
  name: 'session',
  keys: ['split4ever', 'split4ever, ever'],
  cookie: {
    maxAge : 30*24*60*60*1000
  }
};

//custom modules
var custom = require('./common/custom.js');
var collections = require('./collections/route.js');
var authentication = require('./auth/authentication.js');

var app = express();
app.use(cookieSession(cookieSessionProps));
app.use(cookieParser());
app.set('port', process.env.PORT || PORT);

var options = {
  dotfiles: 'ignore',
  etag: false,
   extensions: ['png', 'html'],
  //index: false,
  redirect: false
};

app.use(express.static('public', options));
app.use('/api/collections', authentication.authenticate, collections);

// custom 404 page
app.use(function(req, res){
	//logger.info(util.format('reached 404: %s', util.inspect(req)));
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

var server = app.listen(app.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;
  logger.info(util.format('split4ever listening at http://%s:%s', host, port));

});
