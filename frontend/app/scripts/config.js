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
    			dimension: { w: 400, h: 300}
    		}
            , partAlertArea: '#partAlert'
    	}
    	, API : {
    		url: '/api'
            , auth: {
                url: '/auth'
            } 
    	}
        , AUTH : {
            adminId: 'ssoexp-ucv0ssb7w7-ct20.iam.ibmcloud.com/www.ibm.com/app'
        }
        , ALERT: {
            container: '#appAlertArea'
            , timeout: 10000
            , customClass: 'appAlert'

        }
  });

