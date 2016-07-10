'use strict';

describe('Controller: PartCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var PartCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PartCtrl = $controller('PartCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(PartCtrl.awesomeThings.length).toBe(3);
  });
});
