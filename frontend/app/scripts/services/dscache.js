'use strict';

angular.module('frontendApp').service( 'dscache',
  function (api){

    var os = [];
    var filter = {};

    var setFilter = function(cf){
        filter = cf;
        os = [];
    };

    var getByIndex = function (index, buffer, callback){

      console.log('[dscache.getByIndex] IN (%d,%d, ...)', index, buffer );

      if(1 > buffer)
        throw "buffer must be a non-zero positive number";
      if(index > os.length)
        throw "index should be contained or adjacent to the existent array";

      var index1 = index;
      var index2 = index + buffer -1;
      if(index1 > index2)
        throw "first range index can not be higher than the last range index";

      assureIndexRange(index1, index2, callback);

    };

    var partArrayIds2String= function(a){
      var r = null;
      for(var i = 0; i < a.length; i++){
        if(null == r)
          r = a[i]._id;
        else
          r = r + ', ' + a[i]._id;
      }
      return null == r ? "" : r;
    };

    var assureIndexRange = function(i1, i2, callback){
      console.log('[dscache.assureIndexRange] IN (%d,%d, ...)', i1, i2 );

      var mustLoad = false;
      var firstIndex2retrieve = null;
      var secondIndex2retrieve = null;

      if(i2 >= os.length){
        firstIndex2retrieve = os.length;
        secondIndex2retrieve = i2;
        mustLoad=true;
      }

      if(mustLoad){

        var loadCallback = function(parentCallback){
          var func = function(err, r){
             if(err){
                if (parentCallback)
                  parentCallback(err)
             }
            else
              if(parentCallback){
                console.log('cache before slice: %s', partArrayIds2String(os));
                var slice = os.slice(i1, i2+1)
                console.log('slice [%d - %d]: %s', i1, i2+1, partArrayIds2String(slice));
                parentCallback(null, slice);
              }
          };

          return {func: func};
        }(callback);

        load(firstIndex2retrieve, secondIndex2retrieve, loadCallback.func)
      }
      else {
        if(callback){
          console.log('[dscache.assureIndexRange] cache before slice: %s', partArrayIds2String(os));
          var slice = os.slice(i1, i2+1)
          console.log('[dscache.assureIndexRange] slice [%d - %d]: %s', i1, i2+1, partArrayIds2String(slice));
          callback(null, slice);
        }
      }

    };

    var load = function(idx1, idx2, callback){
      console.log('[dscache.load] IN (%d,%d, ...)', idx1, idx2 );
      var id = null;

      if(0 == idx1)
        id = 0;
      else
        id = os[idx1-1]._id;

      api.getDatasourceItems(
        {'_id': id,  'n': (idx2 - idx1 + 1) , 'filter': filter},
        function(err, o){
          if(err){
            console.log(err)
          }
          else {
            console.log('got %d parts', o.length);
            o.forEach(function(el){
              os.push(el)
            });
            callback(null, o);
          }
      });
    }

    return {
      getByIndex: getByIndex
      , setFilter: setFilter
    };

  }
);


