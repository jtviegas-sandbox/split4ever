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
                callback(null, response.data);
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
        };
        if(input.tags)
          options.params = { 'tags': input.tags };
        
        $http(options).then(
            function success(response) {
              if(callback)
                callback(null, response.data);
            },
            function error(response) {
              if(callback)
                callback(response)
            }
        );
      };



      var getTags = function(callback){
/*        $http({
            method: 'GET'
            , url: config.API.url + '/collections/tag'
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
        );*/

        callback(null, { result: [{'text': 'travoes'}, {'text': 'espelhos'}, {'text': 'portas'}, {'text': 'rodas'}, {'text': 'embraiagens'}] });

      };

      var addTag = function(input, callback){

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
      };

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

      return { 
        setItem: setItem
        , delItem: delItem
        , getItem: getItem
        , getTags: getTags
        , addTag: addTag
        , getDatasourceItems: getDatasourceItems
        , getSession: getSession
      };
    }
  ) 
;


