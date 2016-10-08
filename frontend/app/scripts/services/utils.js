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
    };

    var findNamePropertyIndexInArrayObj = function(arr, name){
      for( var i=0; i<arr.length; i++){
        var o = arr[i];
        if(o.name == name){
          return i;
        }
      }
      return -1;
    };

    return {
      getObjProperties: getObjProperties
      , findNamePropertyIndexInArrayObj: findNamePropertyIndexInArrayObj
    };

  }
);


