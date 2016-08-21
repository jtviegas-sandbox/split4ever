'use strict';

angular.module('frontendApp').service( 'utils', 
  function (){


    var getObjProperties = function(o){
      var r=[];
      for(var propName in o){
        if(o.hasOwnProperty(propName))
          r.push(propName); 
      }
      return r;
    }

    return { 
      getObjProperties: getObjProperties
    };

  } 
);


