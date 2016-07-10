'use strict';

describe('Controller: NewpartCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var NewpartCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NewpartCtrl = $controller('NewpartCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(NewpartCtrl.awesomeThings.length).toBe(3);
  });
});
