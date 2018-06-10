"use strict";
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parse');
const customutils = require('../../common/customutils')
var logger = require('../../common/apputils').logger;

var dataStore = function() {

    const DEFAULT_FILE = __dirname + '/data.csv';
    var data = null;

    var toImageObj = function(_path){
        var o = {};
        o.name = path.posix.basename(_path);
        o.type = path.extname(o.name);
        o.data = customutils.fileToBase64(_path);
        return o;
    }

    var findImgObjs = function(_path){

        let o = {}
        let f = fs.readdirSync(_path);
        
        f.forEach(file => {
            
            if(file.match('^[0-9]+\_[0-9]+\.png')){
                let _file = path.posix.basename(file);
                let us = _file.indexOf('_');
                let p = _file.indexOf('.');
                let partNumber = _file.slice(0,us);
                let imgNumber = _file.slice(us+1, p);

                if(!o[partNumber])
                    o[partNumber] = []
                
                o[partNumber].push(toImageObj(_path + "/" + file));

            }
            
        });

        return o;

    }

    var toPart  = function(fieldsArray, imgArray){

        let p = {};
        p.id = customutils.createUuid();
        p.name = fieldsArray[1]
        p.price = fieldsArray[2]
        p.category = fieldsArray[3]
        p.subcategory = fieldsArray[4]
        p.notes = fieldsArray[5]
        p.images = imgArray[fieldsArray[0]]
        return p;
    };

    // data file format: 'id', number', 'name', 'price', 'category', 'subcategory', 'notes' 

    function loadAsyncFunction(_datafile){
        let _folder = path.dirname(_datafile);
        let imgs = findImgObjs(_folder);
        return new Promise(resolve => {
            let d = [];
            fs.createReadStream(_datafile)
            .pipe(csvParser({delimiter: ','}))
            .on('data', function(l) {
                logger.debug('@data %s',l);
                d.push(toPart(l, imgs));
            })
            .on('end',function() {
                logger.debug('@end: %s', d);
                resolve(d);
            })
            .on('error', function() {
                logger.debug('@error: %s',d);
                resolve(null);
            });
        });
    }

    async function init (){
        logger.debug('[dataStore.init] IN');
        data = await loadAsyncFunction(DEFAULT_FILE);
        let status = (data !== null);
        logger.debug('[dataStore.init] OUT');
        if(status)
            logger.info("store has %d objs", data.length);
        else
            logger.info("store got no data");

    }

    var getObjIndex = function(obj){
        let r = -1
        if( obj.id ){
            let s = data.filter(e => obj.id === e.id)
            if(1 === s.length)
                r = data.indexOf(s[0]);
        }
        
        return r;
    }

    var getIdIndex = function(id){
        let r = -1
        if( id ){
            let s = data.filter(e => id === e.id)
            if(1 === s.length)
                r = data.indexOf(s[0]);
        }
        
        return r;
    }

    var syncSetObj = function(o){
        let idx = getObjIndex(o);
        if( idx > -1 )
            data[idx] = o;
        else{
            if( !o.id )
                o.id = customutils.createUuid();
            data.push(o);
        }
    }

    var setObj = function(o, cb){
        try{
            syncSetObj(o);
            cb(null, o);
        }
        catch(error){
            cb(error);
        }
        
    }

    var getObj = function(id, cb){
        try{
            let r = null;
            let idx = getIdIndex(id);
            if( idx > -1 )
                r = data[idx];
            cb(null, r);
         }
        catch(error){
            cb(error);
        }
    }

    var getObjs = function(cb){
        logger.debug('[dataStore.getObjs] IN');
        try{
            cb(null, [...data]);
         }
        catch(error){
            cb(error);
        }
        logger.debug('[dataStore.getObjs] OUT');
    }

    var removeObj = function(id, cb){
        try {
            let r = null;
            let idx = getIdIndex(id);
            if( idx > -1 )
                r = data.splice(idx,1);
            cb(null, r);
         }
        catch(error){
            cb(error);
        }
    }

    var setObjs = function(os, cb){
        try {
            os.forEach(function(o) {
                syncSetObj(o);
            }); 
            cb(null, [...data]);
         }
        catch(error){
            cb(error);
        }
    }

    var clear = function(cb){
        try {
            let o = data.splice(0);
            cb(null, o);
         }
        catch(error){
            cb(error);
        }
    }

    init();

    return {
        setObj: setObj
        , getObj: getObj
        , getObjs: getObjs
        , removeObj: removeObj
        , setObjs: setObjs
        , clear: clear
    };

}();

module.exports = dataStore;

