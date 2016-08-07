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
  });
