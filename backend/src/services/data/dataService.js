"use strict";

var logger = require('./../../common/apputils').logger;
var storeFactory =  require('../store/dataStoreFactory')

var dataService = function(){

    var store = null;
    var on = false;

    // ---------------------------------------------------------------------------
    // ----------------------------------PRIVATE METHODS--------------------------

    var init = function (){
        logger.debug('[dataService.init] IN');
        if(!on){
            store = storeFactory.get();
            on = store.init();
        }
        logger.debug('[dataService.init] OUT');
    };

    var statusCheck = function(){
        if(!on)
            init();
    }

    // ---------------------------------------------------------------------------
    // ----------------------------------PUBLIC METHODS--------------------------

    var setPart = function(part, callback){
        statusCheck();
        logger.debug('[dataService.setPart] IN');
        store.setObj(part, callback);        
        logger.debug('[dataService.setPart] OUT');
    };

     var getPart = function(id, callback){
        statusCheck();
        logger.debug('[dataService.getPart] IN');
        store.getObj(id, callback);        
        logger.debug('[dataService.getPart] OUT');
    };

    var clearParts = function(callback){
        statusCheck();
        logger.debug('[dataService.clearParts] IN');
        store.clear(callback);        
        logger.debug('[dataService.clearParts] OUT');
    };

    var removePart = function(id, callback){
        statusCheck();
        logger.debug('[dataService.removePart] IN');
        store.removeObj(id, callback);        
        logger.debug('[dataService.removePart] OUT');
    };

    var getParts = function(callback){
        statusCheck();
        logger.debug('[dataService.getParts] IN');
        store.getObjs(callback);        
        logger.debug('[dataService.getParts] OUT');
    };

   

    // ---------------------------------------------------------------------------

    init();

    return {
        setPart: setPart
        , getPart: getPart
        , clearParts: clearParts
        , removePart: removePart
        , getParts: getParts
    };

}();

module.exports = dataService;
