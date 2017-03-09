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
    'ngLocale',
    'ui.bootstrap'
    , 'ngTagsInput'
    , 'mgcrea.ngStrap'
    , 'pascalprecht.translate'
    , 'infinite-scroll'

  ])
  .config(function ($routeProvider, $locationProvider, tagsInputConfigProvider) {
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
      .when('/part/:id', {
        templateUrl: 'views/part.html',
        controller: 'partCtrl',
        controllerAs: 'part'
      })
      .when('/contact', {
        templateUrl: 'views/contact.html',
        controller: 'ContactCtrl',
        controllerAs: 'contact'
      })
      .otherwise({
        redirectTo: '/'
      });

      tagsInputConfigProvider.setDefaults('tagsInput', {  minLength: 1 });

     //check browser support
      if(window.history && window.history.pushState){
          //$locationProvider.html5Mode(true); will cause an error $location in HTML5 mode requires a  tag to be present!
          //Unless you set baseUrl tag after head tag like so: <head> <base href="/">

       // to know more about setting base URL visit: https://docs.angularjs.org/error/$location/nobase

       // if you don't wish to set base URL then use this
       $locationProvider.html5Mode(true);
      }
  })
  .controller( 'AppCtrl',
    function($scope, $location, $http){

    }
  );

angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 1000)
