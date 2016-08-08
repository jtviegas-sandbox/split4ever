'use strict';

angular.module('frontendApp').service( 'session', 
  function (api, config){

    var o = { loggedIn: false,
      AdminloggedIn: false };

    var get = function (callback){
      console.log('[session.get] IN');

      var localCallback = function(err, r){

        if(!err && r.user){
          o.loggedIn = true;
          o.user = r.user;
              if(r.user.id == config.AUTH.adminId)
                  o.AdminloggedIn = true;
        }
        else {
          if(err)
            console.log('[session.get] err: %s', JSON.stringify(err));
          
          o = { loggedIn: false ,
            AdminloggedIn: false};
        }

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
