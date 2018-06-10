"use strict";

const uuid = require('uuid');
var util = require('util');
var logger = require(__dirname + '/../services/common/apputils').logger;

class Part {

    constructor(o){
        let fields = [ 'id', 'name', 'price', 'category', 'subcategory', 'notes', 'images' ];

        if(o)
            for(var propName in o)
                if(o.hasOwnProperty(propName) && -1 < fields.indexOf(propName.toLowerCase()))
                    this[propName.toLowerCase()] = o[propName]
        
        logger.debug('created instance: %s', util.inspect(this));
    }

    assignId(){
     this.id =  uuid();  
    }

}

module.exports = Part;