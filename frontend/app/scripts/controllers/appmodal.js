'use strict';

angular.module('frontendApp')
  .controller('TextInputAppModalInstanceCtrl', function ($scope, $uibModalInstance, params) {
	  $scope.value = null;
	  $scope.title = params.title;
	  
	  $scope.ok = function () {
	    $uibModalInstance.close($scope.value);
	  };

	  $scope.cancel = function () {
	    $uibModalInstance.dismiss('cancel');
	  };

  })
  .controller('OkCancelAppModalInstanceCtrl', function ($scope, $uibModalInstance, params) {
	  $scope.value = null;
	  $scope.title = params.title;
	  $scope.text = params.text;
	  
	  $scope.ok = function () {
	    $uibModalInstance.close(true);
	  };

	  $scope.cancel = function () {
	    $uibModalInstance.dismiss(false);
	  };

  });
