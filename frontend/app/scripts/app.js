'use strict';

/**
 * @ngdoc overview
 * @name frontendApp
 * @description
 * # frontendApp
 *
 * Main module of the application.
 */
angular
  .module('frontendApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap'
    ,'ngTagsInput'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/parts/0', {
        templateUrl: 'views/newpart.html',
        controller: 'NewpartCtrl',
        controllerAs: 'newpart'
      })
      .when('/parts/:id', {
        templateUrl: 'views/part.html',
        controller: 'PartCtrl',
        controllerAs: 'part'
      })
      .when('/parts', {
        templateUrl: 'views/parts.html',
        controller: 'PartsCtrl',
        controllerAs: 'parts'
      })
      .when('/contact', {
        templateUrl: 'views/contact.html',
        controller: 'ContactCtrl',
        controllerAs: 'contact'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .controller( 'AppCtrl', 
    function($scope, $location, $http){

    }
  );
