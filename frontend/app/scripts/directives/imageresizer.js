'use strict';


angular.module('frontendApp')
  .directive('imageresizer', function () {
    return {
        restrict: 'A',
        scope: {
            obj: '='
            , size: '='
            , canvasid: '='
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
                var canvas = document.getElementById(scope.canvasid);
                canvas.width = scope.size.w;
                canvas.height = scope.size.h;


                var ratio;
                if(curW > curH){
                  // landscape -- limit the width
                  ratio = scope.size.w/curW;
                  canvas.width = scope.size.w;
                  canvas.height = scope.size.h;
                }
                else {
                  //portrait -- limit the height
                  ratio = scope.size.w/curH;
                  canvas.width = scope.size.h;
                  canvas.height = scope.size.w;
                }

                if(ratio < 1){//if image width is bigger then config width
                    //resize image to match the config width
                    endW = curW * ratio;
                    endH = curH * ratio;
/*                    if(endH > scope.size.h){
                        ratio = scope.size.h/curH;
                        endW = curW * ratio;
                        endH = curH * ratio;
                    }*/
                }

                //if image smaller than canvas, on width or height, locate it in the center
                var xdiff = canvas.width - endW;
                var ydiff = canvas.height - endH;
                var xborder = 0;
                var yborder = 0;

                if(0 < xdiff)
                    xborder = xdiff/2;

                if(0 < ydiff)
                    yborder = ydiff/2;

                var ctx = canvas.getContext('2d');
                ctx.drawImage(el[0], xborder, yborder, endW, endH);
                scope.obj._resized = true;
                scope.obj.data = canvas.toDataURL(scope.obj.type);
            });
        }
    };
  });
