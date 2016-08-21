'use strict';

angular.module('frontendApp')
  .controller('partCtrl', ['$scope', '$routeParams', 'config', 'api', 'app',  
    '$location', '$window', '$log', 'session', 'utils', 
    function ($scope, $routeParams, config, api, app, $location, $window, $log, session, utils) {

      $scope.session = { loggedIn: false, AdminloggedIn: false };
      $scope.categories = { '___new_category___': { 'name': '___new_category___', subs:[]}};

      $scope.categoryClicked = function($event){
        if( 0 == $event.currentTarget.selectedOptions[0].index && $event.currentTarget.selectedOptions[0].innerText != ''){
        //if('___new_category___' == $scope.item.category){
          app.showAppModal('sm', 'add new category', function(err, o){
            if(null == err && null != o){
              var newcat = { 'name':o, subs:[] };
              $scope.categories[newcat.name] = newcat;
              $scope.item.category = newcat.name;
            }
          });
        }
      };

      $scope.subCategoryClicked = function($event){
        if( 0 == $event.currentTarget.selectedOptions[0].index && $event.currentTarget.selectedOptions[0].innerText != ''){
        //if('___new_category___' == $scope.item.category){
          app.showAppModal('sm', 'add new sub category', function(err, o){
            if(null == err && null != o){
              $scope.item.subCategory = o;
              $scope.categories[$scope.item.category].subs.push(o);
            }
          });
        }
      };

      api.getCategories(function(err, o){
        if(err){
          console.log('couldn\'t load categories: %j', err);
        }
        else{
          if(0 < o.length){
            o.forEach(function(e){
              $scope.categories[e.name] = e;
            });
          }
          console.log('loaded categories cache with %d items', o.length);
        }
      });

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
