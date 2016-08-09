'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:NavbarCtrl
 * @description
 * # NavbarCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('NavbarCtrl', [ '$scope', '$window', '$location', 'config', 'app', 
  	'api', '$rootScope', 'session',
  	function ($scope, $window, $location, config, app, api, $rootScope, session) {
    
    $scope.literals = config.LITERALS;
    var tagsCache = [];
    $scope.tagsFilter = [];

    $scope.session = { loggedIn: false,
      AdminloggedIn: false };
    

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

    api.getTags(function(err, o){
		if(err){
		  console.log('couldn\'t load tags cache: %j', err);
		}
		else{
		  var cacheLen = o.length;
		  if(0 < cacheLen)
		    Array.prototype.push.apply(tagsCache, o);

		  console.log('loaded tags cache with %d items', cacheLen);
		}
	});

    session.get(function(err, r){
        $scope.session  = r;
    });

    $scope.$watchCollection('tagsFilter', function ( newValue, oldValue ) {
			$rootScope.$emit('tagsFilterUpdate', newValue);
        }
    );

    //function called by <ul class="nav navbar-nav"> in index.html to adjust header items class
	$scope.pageClass = function(path){
		return (path == '/' + $location.path().split('/')[1]) ? 'active' : '';
	};

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

	

  }]);
