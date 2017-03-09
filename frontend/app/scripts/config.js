'use strict';

angular.module('frontendApp')
    .constant('config', {
	    LITERALS: {
	      appTitle: 'split4ever'
        , subTitle1: 'classic VW parts: sale and purchase'
        , subTitle2: 'used | old stock | new old stock | reworked'
        , phone: '+351 91 91 594 54'
        , tagsFilterPlaceholder: '...filter parts by tags'
        , partSubmitFailed: 'failed to submit part'
        , partDeleteFailed: 'failed to delete part'
        , partSubmitOk: 'successfully submitted part'
        , partDeleteOk: 'successfully deleted part'
    	}
    	, PART: {
    		image: {
    			dimension: { w: 832, h: 624}
    		}
        , shortenedTextMaxLength: 64
        , partAlertArea: '#partAlert'
    	}
    	, API : {
    		url: '/api'
            , auth: {
                url: '/auth'
            }
    	}
      , AUTH : {
          adminGroup: 'admin'
      }
      , ALERT: {
          container: '#appAlertArea'
          , timeout: 10000
          , customClass: 'appAlert'

      }
      , CACHE: {
	      initialSize: 20
      }
      , MAIN: {
	      partsLoadSize: 8
      }
  });

