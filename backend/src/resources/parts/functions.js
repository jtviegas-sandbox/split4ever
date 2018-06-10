"use strict";

var util = require('util');
var logger = require('../../services/common/apputils').logger;
var config = require('../../config');
var data = require('../../services/data/dataService');


var PartsFunctions = function(){


    var getParts = function(req,res){
        logger.debug('[PartsFunctions.getParts] IN');

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

        data.getParts(callback);
        logger.debug('[PartsFunctions.getParts] OUT');
    };




    return {
        getParts: getParts
    };

}();

module.exports = PartsFunctions;
