'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('MainCtrl', [ '$scope', 'dscache','$timeout',  function ($scope, dscache, $timeout) {

    $scope.datasource = function(){

    	var minIndex = 0;
    	var maxIndex = 0;

    	var partArrayIds2String= function(a){
      		var r = null;
	      for(var i = 0; i < a.length; i++){
	        if(null == r)
	          r = a[i]._id;
	        else
	          r = r + ', ' + a[i]._id; 
	      }
	      return r;
	    };

    	var get = function(index, count, success){

    		console.log('[datasource.get] asking for index: %d and count: %d', index, count);

    		$timeout(
			dscache.getByIndex(index, count, function(err, r){
    			if(err)
    				console.log(err);
    			else {
    				console.log('[datasource.get] got %d parts', r.length);

	    			if(0 < r.length){
	    				if(index < minIndex)
    						minIndex=index;
    					if(maxIndex < index + r.length -1)
    						maxIndex = index + r.length -1;

    					console.log('[datasource.get] minIndex: %d | maxIndex: %d | got %d parts !', minIndex, maxIndex, r.length);
    					console.log('[datasource.get] %s', partArrayIds2String(r));
    				}
    			
    				
    				success(r);
    			}
    		}), 1000);
  
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
