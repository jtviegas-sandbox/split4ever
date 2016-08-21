'use strict';

angular.module('frontendApp')
  .controller('AppModalInstanceCtrl', function ($scope, $uibModalInstance, params) {
	  $scope.value = null;
	  $scope.title = params.title;
	  
	  $scope.ok = function () {
	    $uibModalInstance.close($scope.value);
	  };

	  $scope.cancel = function () {
	    $uibModalInstance.dismiss('cancel');
	  };

  });
