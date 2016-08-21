'use strict';

angular.module('frontendApp')
  .controller('NavbarCtrl', [ '$scope', '$window', '$location', 'config', 'app', 
  	'api', '$rootScope', 'session',
  	function ($scope, $window, $location, config, app, api, $rootScope, session) {
    
    $scope.literals = config.LITERALS;
    $scope.categories = {};
    $scope.categoryFilter = {
      category: null
      , subCategory: null
    };

    

    $scope.session = { loggedIn: false, AdminloggedIn: false };

    $scope.$watchCollection('categoryFilter', function ( newValue, oldValue ) {
      $rootScope.$emit('categoryFilterUpdate', newValue);
        }
    );

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

  api.getCategories(function(err, o){
    if(err){
      console.log('couldn\'t load categories: %j', err);
    }
    else{
      if(0 < o.length){
        o.forEach(function(e){
          console.log('got category: %s', JSON.stringify(e));
          $scope.categories[e.name] = e;
        });
      }
      console.log('loaded categories cache with %d items', o.length);
    }
  });

  session.get(function(err, r){
        $scope.session  = r;
    });

  }]);


/*
  session.get(function(err, r){
        $scope.session  = r;
    });

  var tagsCache = [];
    $scope.tagsFilter = [];
    $scope.getTags = function(){
          //var tags = ['travoes', 'espelhos', 'portas', 'rodas', 'embraiagens'];
          var r = [];
          var state = [];
          Array.prototype.push.apply(state, $scope.tagsFilter);
          tagsCache.forEach(function(value, index, array){

            if(0 > app.findTagIndexInArray(state, value))
              r.push(value); 

          });
          return r;
      };
      //function called by <ul class="nav navbar-nav"> in index.html to adjust header items class
    $scope.pageClass = function(path){
      return (path == '/' + $location.path().split('/')[1]) ? 'active' : '';
    };

$scope.$watchCollection('tagsFilter', function ( newValue, oldValue ) {
      $rootScope.$emit('tagsFilterUpdate', newValue);
        }
    );

    */