var express = require('express');
var bodyParser = require('body-parser');
var logger = require('../common/utils').appLogger;
var authentication = require('../auth/authentication');

var functions = require('./functions');
logger.trace('started loading...');
var router = express.Router();

router.use(bodyParser.json({limit: '50mb'})); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); // for parsing application/x-www-form-urlencoded

router.get('/:name/:id/:n', functions.getNfromId);
router.get('/:name/categories', functions.getCategories);
router.get('/:name/:id', functions.get);

router.get('/:name', functions.getAll);
router.delete('/:name/:id/:rev', authentication.verifyAuth, functions.del);

router.post('/:name', authentication.verifyAuth, functions.post);

logger.trace('...finished loading.');
module.exports = router;
