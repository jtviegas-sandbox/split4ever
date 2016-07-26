'use strict';

angular.module('frontendApp')
    .constant('config', {
	    LITERALS: {
	      appTitle: 'split4ever'
    	}
    	, PART: {
    		image: {
    			dimension: { w: 400, h: 300}
    		}
    	}
    	, API : {
    		url: '/api'
    	}
        , ALERT: {
            container: '#appAlertArea'
            , timeout: 10000
            , customClass: 'appAlert'

        }
  });

