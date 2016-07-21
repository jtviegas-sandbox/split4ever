'use strict';

angular.module('frontendApp')
  .service( 'api', function (utils, $q, $resource, $http){

      var setDocGroup = function(input, callback){

        var url = '/itsm/api/cognitive/docgroup';
        var data = input;
        var config = {
          headers: { 'Content-Type': 'application/json' }
        };

        $http.post(url, data, config)
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

      return { 
        getAnswers: getAnswers
        , setFeedback: setFeedback
        , getLastTrained: getLastTrained
        , getUserInfo: getUserInfo
        , setClick: setClick
        , setDocGroup: setDocGroup
        , getDocGroupId: getDocGroupId
        , getDocGroup: getDocGroup
        , deleteDocGroup: deleteDocGroup
      };

    }
  )
;


