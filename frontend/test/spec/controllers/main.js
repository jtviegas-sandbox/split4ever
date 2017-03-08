'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var $controller, $scope;

  beforeEach(inject(function (_$controller_, $rootScope) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $scope =  $rootScope.$new();
    $controller = _$controller_;

  }));

  describe('sum', function () {

    it('1 + 1 should equal 2', function () {

      var controller = $controller('MainCtrl', { $scope: $scope });
      var descriptor = { index: 0, count: 4 , append: true };

      $scope.datasource.get(descriptor, function(err, r){
        expect(r).toBe(0);
      });
    });



  });




});
