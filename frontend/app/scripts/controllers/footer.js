'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:FooterCtrl
 * @description
 * # FooterCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('FooterCtrl', function ($scope, config) {
  	$scope.literals = config.LITERALS;
    $scope.map = {
      center: { latitude: 38.7372928, longitude: -9.05985 }
      , zoom: 10
      , options: {scrollwheel: false}
      , marker : {
        id: 0
        , coords: {
          latitude: 38.749523
          , longitude: -8.965427
        }
        , options: {
          draggable: true
          , title: 'split4ever \nRua da split4ever'
          , animation: 'DROP'
        }
      }
    };
  });
