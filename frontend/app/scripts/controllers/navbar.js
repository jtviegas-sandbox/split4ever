'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:NavbarCtrl
 * @description
 * # NavbarCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('NavbarCtrl', function ($scope, $location) {
    
    //function called by <ul class="nav navbar-nav"> in index.html to adjust header items class
	$scope.pageClass = function(path){
		return (path == '/' + $location.path().split('/')[1]) ? 'active' : '';
	};

  });
