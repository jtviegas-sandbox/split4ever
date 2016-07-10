'use strict';

describe('Controller: PartsCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var PartsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PartsCtrl = $controller('PartsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(PartsCtrl.awesomeThings.length).toBe(3);
  });
});
