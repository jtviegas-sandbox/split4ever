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

      return { 
        setItem: setItem
        , delItem: delItem
      };
    }
  ) 
;


