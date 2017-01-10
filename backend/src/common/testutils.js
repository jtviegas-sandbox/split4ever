/**
 * Created by joaovieg on 24/08/16.
 */
"use strict";
var uuid = require('uuid');
var customUtils = require('./customutils');

var TestUtils = (function(){

    var createParts = function(numOf, isSpotlight) {
        var result = [];
        var n;
        if(!numOf)
            n = 1;
        else
            n = numOf;

        for(var i=0; i<n; i++){
            var o = {
                spotlight : (isSpotlight ? 1 : 0)
                , name: customUtils.randomString(12)
                , price: customUtils.randomNumber(25)
                , model: []
                , category: []
                , notes: customUtils.randomString(36)
                , images: []
            };
            o.model.push(customUtils.randomString(12));
            o.model.push(customUtils.randomString(12));
            o.category.push(customUtils.randomString(12));
            o.category.push(customUtils.randomString(12));

            result.push(o);
        }
        if(1 == n)
            return result[0];
        else
            return result;
    };

    return {
        createParts: createParts
    };

})();

module.exports = TestUtils;
