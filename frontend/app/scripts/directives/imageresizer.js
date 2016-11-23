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
          var canvas = document.getElementById(scope.canvasid);
          canvas.width = scope.size.w;
          canvas.height = scope.size.h;

          var srcY, srcX, srcH, srcW,
            destY, destX, destH, destW, diff;

          var wRatio = scope.size.w/curW;
          var deltaAdjH = (curH * wRatio) - scope.size.h;

          if( deltaAdjH >= 0){
            diff = curH - (scope.size.h/wRatio)
            srcY = diff/2;
            srcX = 0;
            srcH = curH - diff;
            srcW = curW;

            destY = 0;
            destX = 0;
            destH = scope.size.h;
            destW = scope.size.w;
          }
          else {
            diff = (-1) * (deltaAdjH);
            srcY = 0;
            srcX = 0;
            srcH = curH;
            srcW = curW;

            destY = diff/2;
            destX = 0;
            destH = curH * wRatio;
            destW = scope.size.w;
          }

          var ctx = canvas.getContext('2d');
          ctx.fillStyle = 'transparent';
          ctx.fillRect(0,0,scope.size.w,scope.size.h);
          ctx.drawImage(el[0], srcX, srcY, srcW, srcH, destX, destY, destW, destH);
          scope.obj._resized = true;
          scope.obj.data = canvas.toDataURL(scope.obj.type);
        });
      }
    };
  });
