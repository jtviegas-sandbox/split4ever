var PragmaLogger = require('pragma-logger');
var util = require('util');
var logger = require('../common/utils').appLogger;

var config = require('../common/config.js');
var model = require('../common/model.js');
model.init(config.app.db.names, function(err, o){
  if(err)
    logger.error(err);
  else
    logger.info('init\'ed databases');
});

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
    //logger.debug('body: ' + JSON.stringify(obj));
    var callback = function(err, o){
      if(err){
        logger.error(err);  
        res.status(400).end();
      }
      else {
        //logger.info(util.format('ok: ', JSON.stringify(objId)));
        res.status(200).json(o.result);
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
    var rev = req.params.rev;

    var callback = function(err, o){
      if(err){
        logger.error(err);  
        res.status(400).end();
      }
      else {
        res.status(200).end();
      }
    };
    model.del(collectionName, { '_id': id, '_rev': rev }, callback);
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
