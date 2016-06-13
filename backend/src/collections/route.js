var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var multer = require('multer'); 
var PragmaLogger = require('pragma-logger');
var logger = new PragmaLogger({
    logger: {
      charset: 'utf8',
      levels: {
        debug: './logs/%pid_debug_%y-%m-%d-collections_route.log',
        error: './logs/%pid_error_%y-%m-%d-collections_route.log',
        warn: './logs/%pid_warn_%y-%m-%d-collections_route.log',
        trace: './logs/%pid_trace_%y-%m-%d-collections_route.log',
        info: './logs/%pid_info_%y-%m-%d-collections_route.log'
      },
      messageFormat: '%t \t| %name :: %lvl \t| PID: %pid - %msg'
    }
  }, 'collections_route');

var functions = require('./functions');
logger.trace('started loading...');
var router = express.Router();

var bodyParserProps = { extended: true, limit: '10240kb' } ;

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded(bodyParserProps)); // for parsing application/x-www-form-urlencoded
router.use(multer()); // for parsing multipart/form-data

router.get('/:name/all', functions.getAll);
router.get('/:name/:id', functions.get);
router.post('/:name', functions.post);
router.delete('/:name/:id', functions.del);


logger.trace('...finished loading.');
module.exports = router;
