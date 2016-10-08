var PragmaLogger = require('pragma-logger');
var util = require('util');
var logger = require('../common/utils').appLogger;

var config = require('../common/config.js');
var model = require('../common/model.js');

model.init(config.app.db, function(err, o){
  if(err)
    throw err;
  else {
    model.scaffolding(config.app.db, function(err, o){
      if(err)
        throw err;
      logger.info('init\'ed databases');
    });
  }
});

var CollectionsFunctions = function(){

  var getAll = function(req,res){
    logger.trace('<IN>getAll');

    var collectionName = req.params.name;
    var options = null;
    if(req.body)
      options = req.body;

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

    model.getAll(collectionName, callback, options);
    logger.trace('<OUT>getAll');
  };

  var getNfromId = function(req,res){
    logger.trace('<IN>getNfromId');

    var collectionName = req.params.name;
    var id = req.params.id;
    var nRecords = parseInt(req.params.n);

    
    if("0" == id || 0 == id)
      id=0;

    var options = 
      { 
        "selector": {
 
            
              "_id": {
                "$gt": id
              }
            
            ,  "$not":{
                  "_id": {
                    "$regex": "_design/.*"
                  }
                }
            
   
        }
        , "sort": [ { "_id": "asc" } ] 
        , "limit": nRecords
      };

    if(req.query && req.query.filter){
      var filter = JSON.parse(req.query.filter);
      if(null != filter.category){
        options.selector.category = filter.category;
        if(null != filter.subCategory)
          options.selector.subCategory = filter.subCategory;
      }
    }

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

    console.log('going to getsome with options: %s', JSON.stringify(options));
    model.getSome(collectionName, options, callback);
    logger.trace('<OUT>getNfromId');
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

  var getCategories = function(req,res){
    logger.trace('<IN>getCategories');
    var collectionName = req.params.name;
    var callback = function(err, o){
      if(err){
        logger.error(err);  
        res.status(400).end();
      }
      else {
        var r = [];
        if(o && Array.isArray(o)){
          o.forEach(function(e){
            if(null != e.key)
              r.push( { 'name': e.key, 'subs':e.value } )
          });
        }
        res.status(200).json(r);
        res.end();
      }
    };
    model.readView(collectionName, 'categories', { reduce: true, group: true}, callback);
    logger.trace('<OUT>getCategories');
  };

  var findNamePropertyIndexInArrayObj = function(arr, name){

      for( var i=0; i<arr.length; i++){
          var o = arr[i];
          if(o.name == name){
              return i;
          }
      }
      return -1;
  };

  var getModels = function(req,res){
    logger.trace('<IN>getModels');
    var collectionName = req.params.name;
    var callback = function(err, o){
      if(err){
        logger.error(err);
        res.status(400).end();
      }
      else {
          var r = [];
          o.forEach(function(e){ r.push(e.key); });
          res.status(200).json(r);
          res.end();
      }
    };
    model.readView(collectionName, 'models', { reduce: true, group: true}, callback);
    logger.trace('<OUT>getModels');
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
    , getNfromId: getNfromId
    , getCategories: getCategories
    , getModels: getModels
  };

}();

module.exports = CollectionsFunctions;
