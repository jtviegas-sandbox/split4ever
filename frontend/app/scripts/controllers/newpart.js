'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:NewpartCtrl
 * @description
 * # NewpartCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('NewpartCtrl', [ "$scope", function ($scope) {

  	$scope.carousel = {};
  	$scope.carousel.notransition = true;
    $scope.item = {};
    $scope.item.images = [];

    $scope.removeImage = function(o){
    	console.log(o);
		$scope.item.images.splice(o, 1);
    };

  }]);
