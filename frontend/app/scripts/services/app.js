'use strict';

angular.module('frontendApp').service( 'app', 
  function (config, $timeout){

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
    var showAppAlert = function(msg, type){
      var alertType = 'info';
      if(type)
        alertType = type;

      showAlert(config.LITERALS.appTitle + ': ', alertType, msg, 
        config.container, config.timeout,config.customClass);
    };

    var context = {};

    return { 
      showAlert: showAlert
      , showAppAlert: showAppAlert
      , context: context
    };

  } 
);


