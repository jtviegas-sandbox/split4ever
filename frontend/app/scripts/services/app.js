'use strict';

angular.module('frontendApp').service( 'app',
  function ($alert, $timeout, config, $uibModal){

    var textInputTemplate = '<div class="modal-header"> \
                  <h3 class="modal-title" id="modal-title">{{ title }}</h3> \
              </div> \
              <div class="modal-body" id="modal-body"> \
                  <form name="modelform" novalidate> \
                      <div class="form-group" ng-class="{\'has-error\': !modelform.value.$valid}"> \
                      <input name="value" type="text" class="form-control" ng-model="value" required ng-minlength="3" ng-maxlength="64"> \
                  </form> \
              </div> \
              <div class="modal-footer"> \
                  <button ng-show="modelform.$valid" class="btn btn-primary" type="button" ng-click="ok()">OK</button> \
                  <button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button> \
              </div>';
    var okCancelTemplate = '<div class="modal-header"> \
                  <h3 class="modal-title" id="modal-title">{{ title }}</h3> \
              </div> \
              <div class="modal-body" id="modal-body"> \
                  <p> {{ text }} </p> \
              </div> \
              <div class="modal-footer"> \
                  <button class="btn btn-primary" type="button" ng-click="ok()">OK</button> \
                  <button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button> \
              </div>';

    //type: TEXT_INPUT | OK_CANCEL
    var showAppModal = function(size, title, text, type, callback){

      var appModalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title'
        , ariaDescribedBy: 'modal-body'
        , template: (type == 'OK_CANCEL' ? okCancelTemplate : textInputTemplate)
        , controller: (type == 'OK_CANCEL' ? 'OkCancelAppModalInstanceCtrl' : 'TextInputAppModalInstanceCtrl')
        , size: size
        , resolve: {
            params: function(){
               return {
                  'title': title
                  , 'text': text
                     };
                   }
                }
      });

      appModalInstance.result.then(function (input) {
            callback(null, input)
          }, function () {
            callback(null, null)
          });

    }

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

    var shortenText2Ellipsis = function(t){
      var ret = t;
      if (ret.length > config.PART.shortenedTextMaxLength) {
        ret = ret.substr(0,config.PART.shortenedTextMaxLength-3) + "...";
      }
      return ret;
    };

    var context = {};

    return {
      showAlert: showAlert
      , showAppAlert: showAppAlert
      , context: context
      , showAppModal: showAppModal
      , shortenText2Ellipsis: shortenText2Ellipsis
    };

  }
);


