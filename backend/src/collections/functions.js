"use strict";

var util = require('util');
var logger = require('./../common/apputils').logger;
var config = require('../common/config');
var persistence = require('../persistence/persistence');


var CollectionsFunctions = function(){

    var getCategories = function(req,res){
        logger.debug('[CollectionsFunctions.getCategories] IN');

        var callback = function(err, o){
            if(err){
                logger.error(err);
                res.status(400).end();
            }
            else {
                res.status(200).json({"result": o});
                res.end();
            }
        };
        persistence.getCategories(callback);
        logger.debug('[CollectionsFunctions.getCategories] OUT');
    };

    var getModels = function(req,res){
        logger.debug('[CollectionsFunctions.getModels] IN');

        var callback = function(err, o){
            if(err){
                logger.error(err);
                res.status(400).end();
            }
            else {
                res.status(200).json({"result": o});
                res.end();
            }
        };
        persistence.getModels(callback);

        logger.debug('[CollectionsFunctions.getModels] OUT');
    };

    var getSpotlights = function(req,res){
        logger.debug('[CollectionsFunctions.getSpotlights] IN');

        persistence.getSpotlightParts(function(err, o){
            if(err){
                logger.error(err);
                res.status(400).end();
            }
            else {
                res.status(200).json({"result": o});
                res.end();
            }
        });

        logger.debug('[CollectionsFunctions.getSpotlights] OUT');
    };

    var getNPartsFromId = function(req,res){
        logger.debug('[CollectionsFunctions.getNPartsFromId] IN');

        var params = {
            "id": req.params.id
            , "n": parseInt(req.params.n)
        };

        if(req.query){
            if(null != req.query.model)
                params.model = req.query.model;

            if(null != req.query.category)
                params.category = req.query.category;
        }

        var callback = function(err, o){
            if(err){
                logger.error(err);
                res.status(400).end();
            }
            else {
                res.status(200).json({"result": o});
                res.end();
            }
        };

        persistence.getNPartsFromId(params, callback);
        logger.debug('[CollectionsFunctions.getNPartsFromId] OUT');
    };

    var numOfParts = function(req,res){
        logger.debug('[CollectionsFunctions.numOfParts] IN');

        persistence.numOfParts(function(err, o){
            if(err){
                logger.error(err);
                res.status(400).end();
            }
            else {
                res.status(200).json({"result": o});
                res.end();
            }
        });

        logger.debug('[CollectionsFunctions.numOfParts] OUT');
    };

    var downloadParts = function(req,res){
        logger.debug('[CollectionsFunctions.numOfParts] IN');

        persistence.getAllParts(function(err, o){
            if(err){
                logger.error(err);
                res.status(400).end();
            }
            else {
                if(err){
                    logger.error(err);
                    res.status(400).end();
                }
                else {
                    res.setHeader('Content-Type', 'application/parts-download');
                    res.setHeader('Content-disposition', 'attachment; filename=parts.json');
                    res.write(Buffer.from(JSON.stringify(o.result)));
                    res.end();
                }
            }
        });

        logger.debug('[CollectionsFunctions.numOfParts] OUT');
    };

    var getPart = function(req,res){
        logger.debug('[CollectionsFunctions.getPart] IN');

        var id = req.params.id;
        var callback = function(err, o){
            if(err){
                logger.error(err);
                res.status(400).end();
            }
            else {
                res.status(200).json({"result": o});
                res.end();
            }
        };
        persistence.getPart(id, callback);
        logger.debug('[CollectionsFunctions.getPart] OUT');
    };

    var getAllParts = function(req,res){
        logger.debug('[CollectionsFunctions.getAllParts] IN');

        var callback = function(err, o){
            if(err){
                logger.error(err);
                res.status(400).end();
            }
            else {
                res.status(200).json({"result": o});
                res.end();
            }
        };

        persistence.getAllParts(callback);
        logger.debug('[CollectionsFunctions.getAllParts] OUT');
    };

    //curl -vX POST http://localhost:3000/api/collections/part -d @parts.json --header "Content-Type: application/json"
    var setPart = function(req,res){
        logger.debug('[CollectionsFunctions.setPart] IN');

        var obj = req.body;
        var callback = function(err, o){
            if(err){
                logger.error(err);
                res.status(400).end();
            }
            else {
                res.status(200).json({"result": o});
                res.end();
            }
        };

        persistence.setPart(obj, callback);

        logger.debug('[CollectionsFunctions.setPart] OUT');
    };

    var delPart = function(req,res){
        logger.debug('[CollectionsFunctions.delPart] IN');

        var id = req.params.id;
        var rev = req.params.rev;

        var callback = function(err, o){
            if(err){
                logger.error(err);
                res.status(400).end();
            }
            else {
                res.status(200).json({"result": o});
                res.end();
            }
        };
        persistence.delPart({ '_id': id, '_rev': rev }, callback);
        logger.debug('[CollectionsFunctions.delPart] OUT');
    };


    return {
        getAllParts: getAllParts
        , getPart: getPart
        , setPart: setPart
        , delPart: delPart
        , getNPartsFromId: getNPartsFromId
        , getCategories: getCategories
        , getModels: getModels
        , getSpotlights: getSpotlights
        , numOfParts: numOfParts
        , downloadParts: downloadParts
    };

}();

module.exports = CollectionsFunctions;
