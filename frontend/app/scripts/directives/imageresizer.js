'use strict';


angular.module('frontendApp')
  .directive('imageresizer', function () {
    return {
        restrict: 'A',
        scope: {
            obj: '=',
            size: '='
        },
        link: function (scope, el, attrs) {

            el.bind("load", function (loadEvent) {
                if(scope.obj._resized)
                    return;

                var curH = el[0].height;
                var curW = el[0].width;
                var endW = curW;
                var endH = curH;

                /*
                going to take width as the most important
                so it will be the main variable that we won't
                allow to be smaller then the allowed size
                */
                var canvas = document.getElementById("hiddencanvas");
                canvas.width = scope.size.w;
                canvas.height = scope.size.h;
                var ctx = canvas.getContext('2d');
               

                var ratio = scope.size.w/curW;
                if(ratio < 1){
                    endW = curW * ratio;
                    endH = curH * ratio;
                    if(endH > scope.size.h){
                        ratio = scope.size.h/curH;
                        endW = curW * ratio;
                        endH = curH * ratio;
                    }
                }
                
                var xdiff = canvas.width - endW;
                var ydiff = canvas.height - endH;
                var xborder = 0;
                var yborder = 0;

                if(0 < xdiff)
                    xborder = xdiff/2;

                if(0 < ydiff)
                    yborder = ydiff/2;

                ctx.drawImage(el[0], xborder, yborder, endW, endH);
                scope.obj._resized = true;
                scope.obj.data = canvas.toDataURL(scope.obj.type);
                //el[0].setAttribute('src', canvas.toDataURL(scope.obj.type));

                /*while (hiddenarea.hasChildNodes()) {
                    hiddenarea.removeChild(hiddenarea.lastChild);
                }*/
            });
        }
    };
  });