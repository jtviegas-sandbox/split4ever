"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var logger = require('./../common/apputils').logger;
var authentication = require('./authentication')

logger.debug('[auth.route] started loading...');
var router = express.Router();

router.use(bodyParser.json({limit: '50mb'})); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
router.use(cookieParser());
router.use(session({resave: 'true', saveUninitialized: 'true' , secret: 'keyboard cat'}));

router.get('/login', authentication.handleLoginContext, authentication.passport.authenticate('openidconnect', {}));

router.get('/failure', authentication.loginFail);

router.get('/sso/callback', authentication.loginCallback);

router.get('/logout', authentication.logout);

router.get('/session', authentication.session);

logger.debug('[auth.route] ...finished loading.');

module.exports = router;