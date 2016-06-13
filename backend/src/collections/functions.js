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

var model = require('../model.js');

var CollectionsFunctions = function(){

  var getAll = function(req,res){
    logger.trace('<IN>getAll');

    var collectionName = req.params.name;

    var callback = function(err, o){
        if(err){
          logger.error(err);  
          res.status(400).end();
        }
        else {
          res.status(200).json(o);
          res.end();
        }
    };

    model.getAll(collectionName, callback);
    logger.trace('<OUT>getAll');
  };

  var get = function(req,res){
    logger.trace('<IN>get');
    var collectionName = req.params.name;
    var id = req.params.id;
    var callback = function(err, o){
      if(err){
        logger.error(err);  
        res.status(400).end();
      }
      else {
        res.status(200).json(o);
        res.end();
      }
    };
    model.get(collectionName, id, callback);
    logger.trace('<OUT>get');
  };

  var post = function(req,res){
    logger.trace('<IN>post');
    var collectionName = req.params.name;
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
    };

    model.post(collectionName, obj, callback);
    logger.trace('<OUT>post');
  };

  var del = function(req,res){
    logger.trace('<IN>del');
    var collectionName = req.params.name;
    var id = req.params.id;
    var callback = function(err, o){
      if(err){
        logger.error(err);  
        res.status(400).end();
      }
      else {
        res.status(200).end();
      }
    };
    model.del(collectionName, id, callback);
    logger.trace('<OUT>del');
  };

  return {
    getAll: getAll
    , get: get
    , post: post
    , del: del
  };

}();

module.exports = CollectionsFunctions;
