'use strict';

angular.module('frontendApp')
  .controller('partCtrl', ['$scope', '$routeParams', 'config', 'api', 'app', 
    function ($scope, $routeParams, config, api, app) {

      var tagsCache = [];
      api.getTags(function(err, o){
        if(err){
          console.log('couldn\'t load tags cache: %j', err);
        }
        else{
          var cacheLen = o.result.length;
          if(0 < cacheLen)
            Array.prototype.push.apply(tagsCache, o.result);

          console.log('loaded tags cache with %d items', cacheLen);
        }
      });

      var findTagIndexInArray = function(array, tag){
        var r = -1;

        for(var i = 0; i < array.length; i++){
          var t = array[i];
          if( t.text == tag.text){
            r = i;
            break;
          }
        }

        return r;
      };

      $scope.getTags = function(query){
        //var tags = ['travoes', 'espelhos', 'portas', 'rodas', 'embraiagens'];
        var r = [];
        var state = [];
        Array.prototype.push.apply(state, $scope.item.tags);
        tagsCache.forEach(function(value, index, array){
          if( 0 <= value.text.indexOf( query ) ){
            if(0 > findTagIndexInArray(state, value))
              r.push(value);
          } 
        });
        return r;
      };

      

    $scope.config = { part: config.PART };

    $scope.removeImage = function(o){
    	console.log(o);
		  $scope.item.images.splice(o, 1);
    };

    var setNewItem = function(){

      $scope.item = {};
      $scope.item.images = [];
      $scope.item.tags = []; //we'll have here: {'text': ''}
      $scope.$watchCollection('item.tags', function( newval, oldval) {

        if(newval){
          var newTag = null;
          var add = false;
          if(oldval){
            if(newval.length >  oldval.length){
              newval.forEach(function(value, index, array){
                if(0 > findTagIndexInArray(oldval, value)){
                  newTag = value;
                  add = true;
                }
              });
            }
          }
          else {
            if( 0 < newval.length ){
              newTag = newval[0];
              add = true;
            }
          }

          if(add){
            newTag.text = newTag.text.trim().toLowerCase();
            console.log('adding new tag %j', newTag);
            //if is not in cache add it
            if(0 > findTagIndexInArray(tagsCache, newTag)){
              console.log('not in cache going to persist');
              api.addTag(newTag, function(err, r){
                if(err){
                  console.log('could not persist tag: %s', JSON.stringify(err));
                  var idx = findTagIndexInArray($scope.item.tags, newTag);
                  if(0 <= idx){
                    $scope.item.tags.splice(idx, 1);
                    console.log('removed the tag from the part');
                  }
                }
                else {
                  tagsCache.push(newTag);
                  console.log('persisted tag and added it to cache %j ', newTag);
                }
              });
            }

          }

        }

      });

    };

    $scope.submit = function(){
            $scope.formErrors = false;
            if(!$scope.newpartform.$valid){
                $scope.formErrors = true;
                return ;
            }
            
            var callback = function(err, r){
              if(err){
                console.log(JSON.stringify(err));
                //app.showAppAlert(APP_CONSTANTS.LITERALS.docGroupSetNok, 'danger'); 
              }
              else {
                $scope.item._id = r._id;
                $scope.item._rev = r._rev;
                //app.showAppAlert(APP_CONSTANTS.LITERALS.docGroupSetOk, 'success');        
              }
            };
            api.setItem($scope.item,callback);
    };

    $scope.delete = function(){
      
      $scope.formErrors = false;
      if(!$scope.newpartform.$valid){
          $scope.formErrors = true;
          return ;
      }
      
      var callback = function(err, r){
        if(err){
          console.log(JSON.stringify(err));
          //app.showAppAlert(APP_CONSTANTS.LITERALS.docGroupSetNok, 'danger'); 
        }
        else {
          setNewItem();
          //app.showAppAlert(APP_CONSTANTS.LITERALS.docGroupSetOk, 'success');        
        }
      };
      api.delItem($scope.item,callback);
    };

    // load the item
    if( '0' == $routeParams.id ){
      app.showAppAlert('creating a pristine part to be saved later', 'info', '#partAlert');
      setNewItem();
    }
    else {
      var callback = function(err, o){
        if(err){
          app.showAppAlert('could not retrieve the part!', 'danger', '#partAlert');
          setNewItem();
        }
        else {
          $scope.item = o.result;
          app.showAppAlert('retrieved the part successfully!', 'danger', '#partAlert');
        }
      };
      api.getItem({ '_id': $routeParams.id },callback);
    }

    

    

  }]);
