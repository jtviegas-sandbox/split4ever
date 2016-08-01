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

    var context = {};

    return { 
      showAlert: showAlert
      , showAppAlert: showAppAlert
      , context: context
    };

  } 
);


