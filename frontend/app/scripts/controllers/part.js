'use strict';

angular.module('frontendApp')
  .controller('partCtrl', ['$scope', '$routeParams', 'config', 'api', 'app',  
    '$location', '$window', '$log', 'session', 
    function ($scope, $routeParams, config, api, app, $location, $window, $log, session) {

      $scope.session = { loggedIn: false,
      AdminloggedIn: false };

      $scope.tags2string = app.tags2String;

      var tagsCache = [];
      api.getTags(function(err, o){
        if(err){
          console.log('couldn\'t load tags cache: %j', err);
        }
        else{
          var cacheLen = o.length;
          if(0 < cacheLen)
            Array.prototype.push.apply(tagsCache, o);

          console.log('loaded tags cache with %d items', cacheLen);
        }
      });

      $scope.getTags = function(query){
        //var tags = ['travoes', 'espelhos', 'portas', 'rodas', 'embraiagens'];
        var r = [];
        var state = [];
        Array.prototype.push.apply(state, $scope.item.tags);
        tagsCache.forEach(function(value, index, array){
      /*    if( 0 <= value.text.indexOf( query ) ){*/
            if(0 > app.findTagIndexInArray(state, value))
              r.push(value);
        /*  } */
        });
        return r;
      };

      session.get(function(err, r){
        $scope.session  = r;
      });

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
              //array is bigger now, something was added
              newval.forEach(function(value, index, array){
                value.text = value.text.trim().toLowerCase()
                var tag = { 'text': value.text };
                if(0 > app.findTagIndexInArray(oldval, tag)){
                  newTag = tag;
                  add = true;
                }
              });
            }
          }
          else {
            if( 0 < newval.length ){ //being paranoid
              newval[0].text = newval[0].text.trim().toLowerCase()
              newTag = { 'text': newval[0].text};
              add = true;
            }
          }

          if(add){
            console.log('adding new tag %j', newTag);
            //if is not in cache add it
            if(0 > app.findTagIndexInArray(tagsCache, newTag)){
              tagsCache.push(newTag);
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
                app.showAppAlert(config.LITERALS.partSubmitFailed, 'danger', config.PART.partAlertArea); 
              }
              else {
                $scope.item._id = r._id;
                $scope.item._rev = r._rev;
                app.showAppAlert(config.LITERALS.partSubmitOk, 'success', config.PART.partAlertArea);        
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
          app.showAppAlert(config.LITERALS.partDeleteFailed, 'danger', config.PART.partAlertArea); 
        }
        else {
          setNewItem();
          app.showAppAlert(config.LITERALS.partDeleteOk, 'success', config.PART.partAlertArea);        
        }
      };
      api.delItem($scope.item,callback);
    };

    // load the item
    if( '0' == $routeParams.id ){

      console.log('going to load %s', $location.url());
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
          app.showAppAlert('retrieved the part successfully!', 'success', '#partAlert');
        }
      };
      api.getItem({ '_id': $routeParams.id },callback);
    }

    

    

  }]);
