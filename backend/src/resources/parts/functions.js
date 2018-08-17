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

    var getPart = function(req,res){
        logger.debug('[PartsFunctions.getPart] IN');
        var id = req.params.id;
        var callback = function(err, o){
            if(err){
                logger.error(err);
                res.status(500).end();
            }
            else {
                if(o)
                    res.status(200).json(o);
                else
                    res.status(404);
                
                res.end();
            }
        };

        data.getPart(id, callback);
        logger.debug('[PartsFunctions.getPart] OUT');
    };

    var putPart = function(req,res){
        logger.debug('[PartsFunctions.putPart] IN');
        var id = req.params.id;
        var obj = req.body;
        if(id !== obj.id)
            res.status(400).send('id does not match');

        var callback = function(err, o){
            if(err){
                logger.error(err);
                res.status(500).end();
            }
            else {
                res.status(200).json(o);
                res.end();
            }
        };
        data.setPart(obj, callback);
        logger.debug('[PartsFunctions.putPart] OUT');
    };

    var postPart = function(req,res){
        logger.debug('[PartsFunctions.postPart] IN');

        var obj = req.body;
        if(obj.id)
            res.status(422).send('trying to post object with an id');

        var callback = function(err, o){
            if(err){
                logger.error(err);
                res.status(500).end();
            }
            else {
                res.status(201).json(o);
                res.end();
            }
        };
        data.setPart(obj, callback);
        logger.debug('[PartsFunctions.postPart] OUT');
    };

    var delPart = function(req,res){
        logger.debug('[PartsFunctions.delPart] IN');
        var id = req.params.id;

        var callback = function(err, o){
            if(err){
                logger.error(err);
                res.status(500).end();
            }
            else {
                if(o)
                    res.status(204).end();
                else
                    res.status(404).end();
            }
        };
        data.removePart(id, callback);
        logger.debug('[PartsFunctions.delPart] OUT');
    };

    return {
        getParts: getParts
        , getPart: getPart
        , putPart: putPart
        , postPart: postPart
        , delPart: delPart
    };

}();

module.exports = PartsFunctions;
