'use strict';


angular.module('frontendApp')
  .directive('imagebase64input', function () {
    return {
        restrict: 'E',
            replace: 'true',
            template: '<input type="file" accept="image/*" multiple="true" style="color:transparent" />',
        scope: {
            images: "="
        },
        link: function (scope, element, attributes) {

            element.bind("change", function (changeEvent) {

                var fileHandler = function(file, model){
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        scope.$apply(function () {
                            var image = {};
                            image.name = file.name;
                            image.size = file.size;
                            image.type = file.type;
                            //image.data = event.target.result.replace("data:"+ file.type +";base64,", '');
                            image.data = event.target.result;
                            scope.images.push(image);
                        });
                    };
                    reader.readAsDataURL(file);
                };
                for( var i = 0; i < changeEvent.target.files.length; i++)
                    fileHandler(changeEvent.target.files[i], scope.images);
                
            });
        }
    };
  });
