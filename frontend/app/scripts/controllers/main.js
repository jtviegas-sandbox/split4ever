'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('MainCtrl', [ '$scope', '$timeout', 'config', 'api','app','$rootScope',
    function ($scope, $timeout, config, api, app, $rootScope) {

      $scope.literals = config.LITERALS;
      $scope.spotlights = [];
      $scope.models = [];
      $scope.categories = {};
      $scope.appFunctions = app;
      $scope.filter = {
        category: null
        , model: null
      };
      $scope.loading = false;
      $scope.allFetched = false;
      $scope.parts = [];

      $scope.getMoreParts = function(){
        console.log('[MainCtrl.getMoreParts] IN');
        if(!$scope.loading)
          loadParts();
        console.log('[MainCtrl.getMoreParts] OUT');
      };

      $scope.resetFilter = function(){
        console.log('[MainCtrl.resetFilter] IN');
        //$scope.filter = f;
        $scope.parts = [];
        $scope.allFetched = false;
        loadParts();
        console.log('[MainCtrl.resetFilter] OUT');
      };

      var loadParts = function(){
        console.log('[MainCtrl.loadParts] IN');
        $scope.loading = true;
        var fromId = '';
        if(0 < $scope.parts.length)
          fromId = $scope.parts[$scope.parts.length-1]._id
        console.log('[MainCtrl.loadParts] loading parts from id', fromId);
        api.getItemsFromId(
          { 'size': config.MAIN.partsLoadSize , 'filter': $scope.filter, 'id': fromId, 'inclusive': false},
          function(err, o){
            if(err){
              console.log(err)
              if(callback)
                callback(err);
            }
            else {
              console.log('[MainCtrl.loadParts] got %d parts', o.length);
              if(0 < o.length){
                console.log('[MainCtrl.loadParts] last _id is', o[o.length-1]._id);
                Array.prototype.push.apply($scope.parts, o);
              }
              else {
                $scope.allFetched = true;
              }
            }
            $scope.loading = false;
          });
        console.log('[MainCtrl.loadParts] OUT');
      };

      var filterHasChanged = $rootScope.$on('filterUpdate', function(event, data){
        console.log('[MainCtrl.filterHasChanged]: %s', data);
        $scope.resetFilter();
      });

      $scope.$on('$destroy', filterHasChanged);

      $scope.$watchCollection('filter', function (newValue, oldValue ) {
            $rootScope.$emit('filterUpdate', newValue);
        }
      );

      api.getCategories(function(err, o){
        if(err){
          console.log('couldn\'t load categories: %j', err);
        }
        else{
          if(0 < o.length)
            Array.prototype.push.apply($scope.categories, o);

          console.log('loaded categories cache with %d items', o.length);
        }
      });

      api.getModels(function(err, o){
        if(err){
          console.log('couldn\'t load models: %j', err);
        }
        else{
          if(0 < o.length){
            Array.prototype.push.apply($scope.models, o);
            console.log('models', $scope.models);
          }

          console.log('loaded models cache with %d items', o.length);
        }
      });

      api.getSpotlights(function(err, o){
        if(err){
          console.log('couldn\'t load spotlights: %j', err);
        }
        else{
          if(0 < o.length){
            Array.prototype.push.apply($scope.spotlights, o);
            console.log('models', $scope.spotlights);
          }
          console.log('loaded spotlights cache with %d items', o.length);
        }
      });

    }]);
