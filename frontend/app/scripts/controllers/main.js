'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('MainCtrl', [ '$scope', 'dscache',  function ($scope, dscache) {

    $scope.datasource = function(){

    	var minIndex = 0;
    	var maxIndex = 0;

    	var get = function(index, count, success){

    		console.log('asking for index: %d and count: %d', index, count);
    		
    		if(index<0){
    			console.log('asking for negative index, we don not care');
    			return;
    			/*index=0;
    			console.log('changed index: %d and count: %d', index, count);*/
    		}
    		
    		dscache.getByIndex(index, count, function(err, r){
    			if(err)
    				console.log(err);
    			else {

    				if(0 < r.length){
    					minIndex = index;
    					maxIndex = index + r.length -1;
    				}
    				console.log('minIndex: %d   maxIndex: %d   count: %d', minIndex, maxIndex, r.length);
    				success(r);
    			}
    		});
    	};

    	return {
    		get: get
    		, minIndex: minIndex
    		, maxIndex: maxIndex
    	};
	}();

	$scope.tags2String = function(t){
		var r = null;
		for(var i = 0; i < t.length; i++){
			if(null == r)
				r = t[i].text;
			else
				r = r + ', ' + t[i].text;
		}
		return r;
	};

  }]);
