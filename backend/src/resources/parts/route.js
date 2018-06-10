"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var logger = require('../../services/common/apputils').logger;

var functions = require('./functions');
logger.debug('started loading...');
var router = express.Router();

router.use(bodyParser.json({limit: '50mb'})); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); // for parsing application/x-www-form-urlencoded

router.get('/', functions.getParts);

/*
router.get('/part/:id', functions.getPart);
router.get('/part', functions.getParts);

router.post('/part', functions.setPart);
router.delete('/part/:id/:rev', functions.delPart);
*/
logger.debug('...finished loading.');
module.exports = router;
