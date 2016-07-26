'use strict';

angular.module('frontendApp')
  .controller('NewpartCtrl', [ '$scope', 'config', 'api', 'app', function ($scope, config, api, app) {

    $scope.partConf = config.PART;
  	$scope.carousel = {};
  	$scope.carousel.notransition = true;
    $scope.tags = [];
    $scope.item = {};
    $scope.item.tags = []; //we'll have here: {'text': ''}
    $scope.item.images = [];

    $scope.removeImage = function(o){
    	console.log(o);
		  $scope.item.images.splice(o, 1);
    };

    var resetItem = function(){
      $scope.tags = [];
      $scope.item = {};
      $scope.item.tags = []; //we'll have here: {'text': ''}
      $scope.item.images = [];
    };

    $scope.getTags = function(query){

      var tags = ['travoes', 'espelhos', 'portas', 'rodas', 'embraiagens'];
      var r = [];
      if($scope.item.tags && $scope.item.tags.length > 0){
        var state = [];
        Array.prototype.push.apply(state, $scope.item.tags);
        tags.forEach(function(value, index, array){
          if(!state.includes(value))
            r.push(value);
        });
      }
      else 
         Array.prototype.push.apply(r, tags);

      return r;
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
                resetItem();
                //app.showAppAlert(APP_CONSTANTS.LITERALS.docGroupSetOk, 'success');        
              }
            };
            api.delItem($scope.item,callback);
    };

  }]);
