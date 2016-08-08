'use strict';

angular.module('frontendApp').service( 'app', 
  function ($alert, $timeout, config){

    var showAlert = function(title, type, msg, container, timeout, customClass) {
          
      var options = { 'title': title, 
            'content': msg, 
            'container': container,
            'type': type,
            'show': true
          };
      if(customClass)
        options.customClass = customClass;

      var alertWidget = $alert(options);

     if(timeout)
        $timeout(alertWidget.hide, timeout);
    };

    //success(green), info(blue), warning(yellow), danger(red)
    var showAppAlert = function(msg, type, container){

      showAlert(config.LITERALS.appTitle + ': ', 
        (type ? type : 'info'), msg, 
        (container ? container : config.ALERT.container), 
        config.ALERT.timeout,config.ALERT.customClass);
    };


    var findTagIndexInArray = function(array, tag){
        var r = -1;

        for(var i = 0; i < array.length; i++){
          var t = array[i];
          if( t.text == tag.text){
            r = i;
            break;
          }
        }

        return r;
    };

   var tags2String = function(t){
      var r = null;
      if(t){
        if(Array.isArray(t)){
          for(var i = 0; i < t.length; i++){
            if(null == r)
              r = t[i].text;
            else
              r = r + ', ' + t[i].text;
          }
        }
        else
          r = t.toString();
      }
      return r;
    };

    var context = {};

    return { 
      showAlert: showAlert
      , showAppAlert: showAppAlert
      , context: context
      , findTagIndexInArray:findTagIndexInArray
      , tags2String: tags2String
    };

  } 
);


