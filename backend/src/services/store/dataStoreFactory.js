"use strict";

var logger = require('../../common/apputils').logger;

var dataStoreFactory = (function(){

    var get = function() {
        let store = null;
        
        let storeType = 'mock';
        if(process.env.STORE)
            storeType = process.env.STORE.toLowerCase();

        logger.info('[dataStoreFactory.get] store is %s', storeType);
        store = require('./' + storeType + '/dataStore');

        return store;
    };

    return {
        get: get
    };

})();

module.exports = dataStoreFactory;
