'use strict';

angular.module('frontendApp')
  .service( 'api',
    function ($http, config){

      var setItem = function(input, callback){

        var url = config.API.url + '/collections/part';
        var data = input;
        var options = { headers: { 'Content-Type': 'application/json' } };

        $http.post(url, data, options)
          .then(
            function success(response) {
              console.log(response);
              if(callback)
                callback(null, response.data.result);
            },
            function error(response) {
              console.log(response);
              if(callback)
                callback(response)
            }
          );
      };

      var delItem = function(input, callback){

        var id = input._id;
        var rev = input._rev;

        $http({
            method: 'DELETE'
            , url: config.API.url + '/collections/part/' + id + '/' + rev
          }).then(
            function success(response) {
              console.log(response);
              if(callback)
                callback(null);
            },
            function error(response) {
              console.log(response);
              if(callback)
                callback(response)
            }
        );
      };

      var getItem = function(input, callback){
        var id = input._id;
        $http({
            method: 'GET'
            , url: config.API.url + '/collections/part/' + id
          }).then(
            function success(response) {
              console.log(response);
              if(callback)
                callback(null, response.data);
            },
            function error(response) {
              console.log(response);
              if(callback)
                callback(response)
            }
        );
      };

      var getDatasourceItems = function(input, callback){
        console.log('[api.getDatasourceItems] IN (%s)', JSON.stringify(input) );

        var id = input._id;
        var n = input.n;

        var options = {
          method: 'GET'
          , url: config.API.url + '/collections/part/' + id + '/' + n
          , withCredentials : true
          , headers: { 'Content-Type': 'application/json' }
        };

        if(input.filter)
          options.params = input.filter;

        $http(options).then(
            function success(response) {
              if(callback)
                callback(null, response.data.result);
            },
            function error(response) {
              if(callback)
                callback(response)
            }
        );
      };

      var getCategories = function(callback){
        $http({
            method: 'GET'
            , url: config.API.url + '/collections/part/categories'
          }).then(
            function success(response) {
              console.log(response);
              if(callback)
                callback(null, response.data.result);
            },
            function error(response) {
              console.log(response);
              if(callback)
                callback(response)
            }
        );
      };

      var getModels = function(callback){
        $http({
          method: 'GET'
          , url: config.API.url + '/collections/part/models'
        }).then(
          function success(response) {
            console.log(response);
            if(callback)
              callback(null, response.data.result);
          },
          function error(response) {
            console.log(response);
            if(callback)
              callback(response)
          }
        );
      };

/*      var addTag = function(input, callback){

        var url = config.API.url + '/collections/tag';
        var data = input;
        var options = { headers: { 'Content-Type': 'application/json' } };

        $http.post(url, data, options)
          .then(
            function success(response) {
              console.log(response);
              if(callback)
                callback(null, response.data);
            },
            function error(response) {
              console.log(response);
              if(callback)
                callback(response)
            }
          );
      };*/

      var getSession = function(callback) {

        $http({
            method: 'GET',
            url: config.API.auth.url + '/session'
          }).then(
            function success(response) {
              console.log(response);
              if(callback)
                callback(null, response.data);
            },
            function error(response) {
              console.log(response);
              if(callback)
                callback(response)
            }
          );
      };

      var getSpotlights = function(callback){
        $http({
          method: 'GET'
          , url: config.API.url + '/collections/part/spotlights'
        }).then(
          function success(response) {
            console.log(response);
            if(callback)
              callback(null, response.data.result);
          },
          function error(response) {
            console.log(response);
            if(callback)
              callback(response)
          }
        );
      };

      return {
        setItem: setItem
        , delItem: delItem
        , getItem: getItem
        , getCategories: getCategories
        , getDatasourceItems: getDatasourceItems
        , getSession: getSession
        , getModels: getModels
        , getSpotlights: getSpotlights
      };
    }
  )
;


