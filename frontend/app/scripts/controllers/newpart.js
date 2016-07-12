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

    $scope.item = {};
    $scope.item.images = [];

  }]);
