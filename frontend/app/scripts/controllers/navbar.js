'use strict';

angular.module('frontendApp')
  .controller('NavbarCtrl', [ '$scope', '$window', '$location', 'config', 'session', '$translate',
    function ($scope, $window, $location, config, session, $translate) {

      $scope.literals = config.LITERALS;
      $scope.session = { loggedIn: false, AdminloggedIn: false };

      $scope.pageIs = function(path){
        return (path == '/' + $location.path().split('/')[1]) ;
      };

      $scope.login = function(){
        var angularPath = $location.path().replace(/^[/]{1}/, '/#');
        var encodedPath = encodeURIComponent(angularPath);
        var loginUrl = "http://" + $window.location.host + "/auth/login?path=" + encodedPath;
        $window.location.href = loginUrl;
      };

      $scope.logout = function(){
        var logoutUrl = "http://" + $window.location.host + "/auth/logout";
        $window.location.href = logoutUrl;
      };

      session.get(function(err, r){
        $scope.session  = r;
      });

      $scope.changeLanguage = function (langKey) {
        $translate.use(langKey);
      };

    }]);

