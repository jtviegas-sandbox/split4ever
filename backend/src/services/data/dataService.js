"use strict";

var logger = require('./../common/apputils').logger;
const storeFactory =  require(__dirname + '/../store/dataStoreFactory')
var dataService = function(){

    var setPart = function(part, callback){
        logger.debug('[dataService.setPart] IN');
        storeFactory.get().setObj(part, callback);        
        logger.debug('[dataService.setPart] OUT');
    };

     var getPart = function(id, callback){
        logger.debug('[dataService.getPart] IN');
        storeFactory.get().getObj(id, callback);        
        logger.debug('[dataService.getPart] OUT');
    };

    var clearParts = function(callback){
        logger.debug('[dataService.clearParts] IN');
        storeFactory.get().clear(callback);        
        logger.debug('[dataService.clearParts] OUT');
    };

    var removePart = function(id, callback){
        logger.debug('[dataService.removePart] IN');
        storeFactory.get().removeObj(id, callback);        
        logger.debug('[dataService.removePart] OUT');
    };

    var getParts = function(callback){
        logger.debug('[dataService.getParts] IN');
        storeFactory.get().getObjs(callback);        
        logger.debug('[dataService.getParts] OUT');
    };

    var addParts = function(objs, callback){
        logger.debug('[dataService.addParts] IN');
        storeFactory.get().setObjs(objs, callback);        
        logger.debug('[dataService.addParts] OUT');
    };


    return {
        setPart: setPart
        , getPart: getPart
        , clearParts: clearParts
        , removePart: removePart
        , getParts: getParts
        , addParts: addParts
    };

}();

module.exports = dataService;
