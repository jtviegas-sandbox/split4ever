"use strict";
const fs = require('fs');

var logger = require('../common/apputils').logger;

const dataStoreFactory = (function(){

    var stores = {};

    var init = function(){
        fs.readdir(__dirname, (e,files)=>{
            files.forEach(f => {
                logger.debug('[dataStoreFactory.init] processing file %s', f);
                let moduleFile = 'index.js';
                let storetype = f;
                let storetypeFolder = __dirname + '/' + storetype;
                fs.stat( storetypeFolder , (e,s) => {
                    if(!e && s.isDirectory()){
                        logger.debug('[dataStoreFactory.init] processing store %s', storetype);
                        fs.stat( storetypeFolder + '/' + moduleFile , (e,s) => {
                            if(!e && s.isFile()){
                                logger.info('[dataStoreFactory.init] loading store %s', storetype);
                                let store = require(storetypeFolder);

                                stores[storetype.toLowerCase()] = store;
                                logger.info('[dataStoreFactory.init] loaded %s store', storetype);
                            }
                        });
                    }
                });
            });
        });
    }

    var get = function() {
        logger.debug('[dataStoreFactory.get] IN');

        let storeType = 'mock';
        if(process.env.STORE)
            storeType = process.env.STORE.toLowerCase();

        if(!stores[storeType]) 
             throw "!!! couldn't find store " + storeType + " !!!"; 

        logger.debug('[dataStoreFactory.get] OUT');
        return stores[storeType];
    };

    init();

    return {
        get: get
    };

})();

module.exports = dataStoreFactory;
