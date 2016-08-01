'use strict';

angular.module('frontendApp').service( 'dscache', 
  function (api){

    var os = [];

    var getByIndex = function (index, buffer, callback){
      if(1 > buffer)
        throw "buffer must be a non-zero positive number"
      if(index > os.length)
        throw "index should be contained or adjacent to the extistent array"

      var lowIdx = index;
      var id = null;
      var doLoad = false;

      if( (index < os.length) && ( (index+buffer-1) < os.length )  ){
        console.log('[dscache] loading from cache');
        callback(null, os.slice(index, index+buffer));
      }
      else {
        lowIdx = os.length;
          //now we now we have to start querying from the 
          //id of the previous item so...
          if(0 == lowIdx)
            id = "0"
          else
            id = os[lowIdx-1]._id;
          doLoad = true;
      }
   
      if(doLoad){
        console.log('[dscache] loading cache from index %d', lowIdx);
        console.log('[dscache] loading from api using index %d and id %s', lowIdx-1, id);

        load(id, buffer, function(err, r){
          if(err){
            callback(err);
          }
          else {
            for(var i=0; i < r.length; i++){
              os.push(r[i]);
              console.log('[dscache] got id %s', r[i]._id);
            }
            console.log('[dscache] cache size is now %d', os.length);
            console.log('[dscache] going to slice from %d to %d ', index, index+buffer);
            
            var slice = os.slice(index, index+buffer);
            console.log('[dscache] slice size: %d', slice.length);
            callback(null, slice);
          }
        });
      }

    };

    var load = function(id, buffer, callback){

      api.getDatasourceItems(
        {'_id': id,  'n': buffer }, 
        function(err, o){
          if(err){
            console.log(err)
          }
          else {
            console.log('got %d parts', o.length);
            callback(null, o);
          }
      });

    };


    return { 
      getByIndex: getByIndex
    };

  } 
);


