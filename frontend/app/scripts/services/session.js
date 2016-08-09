'use strict';

angular.module('frontendApp').service( 'session', 
  function (api, config){

   

    var get = function (callback){
      console.log('[session.get] IN');

      var localCallback = function(err, r){

        var o = { loggedIn: false, AdminloggedIn: false };

        if(err){
            console.log('[session.get] err: %s', JSON.stringify(err));
        }
        else {
          if(r.user){
            o.loggedIn = true;
            o.user = r.user;
            if(-1 < o.user.groups.indexOf(config.AUTH.adminGroup)){
              o.AdminloggedIn = true;
            }
          }
        }
        console.log(JSON.stringify(o));
        callback(null, o);
      };

      api.getSession(localCallback);

      console.log('[session.get] OUT');
    };


    return { 
      get: get
    };

  } 
);
