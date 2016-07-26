var PragmaLogger = require('pragma-logger');
var util = require('util');
var logger = new PragmaLogger({
    logger: {
      charset: 'utf8',
      levels: {
        debug: './logs/%pid_debug_%y-%m-%d-collections_functions.log',
        error: './logs/%pid_error_%y-%m-%d-collections_functions.log',
        warn: './logs/%pid_warn_%y-%m-%d-collections_functions.log',
        trace: './logs/%pid_trace_%y-%m-%d-collections_functions.log',
        info: './logs/%pid_info_%y-%m-%d-collections_functions.log'
      },
      messageFormat: '%t \t| %name :: %lvl \t| PID: %pid - %msg'
    }
  }, 'collections_functions');

var AuthenticationFunctions = function(){

  
  var authenticate = function(req,res, next){
    logger.trace('<IN>post');
/*    var collectionName = req.params.name;
    var obj = req.body;
    logger.debug('body: ' + JSON.stringify(obj));
    var callback = function(err, objId){
      if(err){
        logger.error(err);  
        res.status(400).end();
      }
      else {
        logger.info(util.format('ok: ', JSON.stringify(objId)));
        res.status(200).json(objId);
        res.end();
      }
    };*/

    logger.trace('<OUT>post');
    next();
  };

   return {
    authenticate: authenticate
  };

}();

module.exports = AuthenticationFunctions;
