'use strict';

angular.module('frontendApp').service( 'dscache',
  function (api, config){

    var filter = null;
    var cache = {
      os: []
    };

    var setFilter = function(cf){
        filter = cf;
        cache.os = [];
        cache.maxIndex = 0;
    };

    var cacheSlicer = function(from, n){
      console.log('[dscache.cacheSlicer] IN (from: %d, n: %d)', from, n);

      var r = { items: [] };
      r.items.push.apply(r.items, cache.os.slice(from, from+n));

      console.log('[dscache.cacheSlicer] OUT => ', r);
      return r;
    };

    var get = function (descriptor, callback){
      // descriptor should be like: { index: x, count: y , append: z }
      console.log('[dscache.get] IN - descriptor: ', descriptor);

      //we interpret the index as being the latest one already in cache
      var currentLastIndex = cache.os.length-1;
      //so based on the parameters being provided
      var howManyItemsWeNeed = 0;
      var indexInclusive = false;

      if( descriptor.index < 0 ) {
        return callback(null, { items: [] , minIndex: cache.minIndex , maxIndex: cache.maxIndex });
      }
      var higherIndex2Have = descriptor.index + descriptor.count;
      var fromId = '';
      var howManyItemsWeNeed = 0;
      if( 0 > currentLastIndex) { // case where cache is empty => cache.length - 1 = -1
        indexInclusive = true;
        howManyItemsWeNeed = descriptor.count;
      }
      else{
        if( higherIndex2Have > (currentLastIndex) ){
          howManyItemsWeNeed = higherIndex2Have - (currentLastIndex);
          fromId = cache.os[currentLastIndex]._id;

        }
      }
      console.log('[dscache.get] d.index: %d   d.count: %d   currentLastIndex: %d   higherIndex2Have: %d   howManyItemsWeNeed: %d   fromId: %s',
        descriptor.index, descriptor.count, currentLastIndex, higherIndex2Have, howManyItemsWeNeed, fromId);

      if(0 < howManyItemsWeNeed){
        api.getItemsFromId(
          { 'size': howManyItemsWeNeed , 'filter': filter, 'id': fromId, 'inclusive': indexInclusive},
          function(err, o){
            if(err){
              console.log(err)
              if(callback)
                callback(err);
            }
            else {
              console.log('[dscache.get] got %d parts', o.length);
              cache.os.push.apply(cache.os, o);
              cache.maxIndex = cache.os.length - 1;
            }
          });
      }

      if(callback){
        var o;
        if(indexInclusive)
          o = cacheSlicer(descriptor.index, descriptor.count);
        else
          o = cacheSlicer(descriptor.index+1, descriptor.count);
        callback(null, o);
      }
      console.log('[dscache.get] OUT');
    };

    return {
      get: get
      , setFilter: setFilter
    };

  }
);


