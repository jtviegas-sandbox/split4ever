"use strict";
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parse');

var dataStore = function() {

    const DEFAULT_FILE = './data.csv';

    var toBase64 = function(file) {
        // read binary data
        let bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return new Buffer(bitmap).toString('base64');
    }

    var toImageObj = function(_path){
        var o = {};
        o.name = path.posix.basename(_path);
        o.type = path.extname(o.name);
        o.data = toBase64(_path);
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
                
                o[partNumber].push(toImageObj(file));

            }
            
        });

        return o;

    }

    var toPart  = function(fieldsArray, imgArray){
        let p = {};
        p.name = fieldsArray[1]
        p.price = fieldsArray[2]
        p.category = fieldsArray[3]
        p.subcategory = fieldsArray[4]
        p.notes = fieldsArray[5]
        p.images = imgArray[fieldsArray[0]]
        return p;
    };

    // data file format: 'number', 'name', 'price', 'category', 'subcategory', 'notes' 
    var load = function(_dataFile, callback){

        let _folder = path.dirname(_dataFile);
        let imgs = findImgObjs(_folder);

        let data=[];
        fs.createReadStream(_dataFile)
            .pipe(csvParser({delimiter: ','}))
            .on('data', function(l) {
                console.log(l);
                data.push(toPart(l, imgs));
            })
            .on('end',function() {
                console.log(data);
                callback(null, data);
            });

    }

    var init = function(callback){
        load(DEFAULT_FILE, callback);
    }

    return {
        init: init
    };

}();

module.exports = dataStore;

