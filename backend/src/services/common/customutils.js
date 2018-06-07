const uuid = require('uuid')
const fs = require('fs');

var CustomUtils = function() {

    var findPropertyIndexInArrayObj = function(arr, property, value){

        for( var i=0; i<arr.length; i++){
            var o = arr[i];
            if(o[property] == value){
                return i;
            }
        }
        return -1;
    };

    var getPropertyArray = function(o){
        var r=[];
        for(var propName in o){
            if(o.hasOwnProperty(propName))
                r.push(o[propName]);
        }
        return r;
    };

    var getPropertyNames = function(o){
        var r=[];
        for(var propName in o){
            if(o.hasOwnProperty(propName))
                r.push(propName);
        }
        return r;
    };

    var getPropertyValues = function(o){
        var r=[];
        for(var propName in o){
            if(o.hasOwnProperty(propName))
                r.push(o[propName]);
        }
        return r;
    };

    var getProperties = function(o){
        var r=[];
        for(var propName in o){
            if(o.hasOwnProperty(propName))
                r.push({ 'name': propName, 'value': o[propName] });
        }
        return r;
    };

    var zeroPad = function zeroPad(num, places) {
        var zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
    };

    var formatWeekOfYear = function(y, w){
        var o = y.toString() + '.' +  zeroPad(w, 2);
        return o;
    };

    var randomString = function(length) {
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    };

    var randomNumber = function(max) {
        return Math.floor(Math.random() * (max+1));
    };
    
    var createUuid = function() {
        return uuid();
    };


    var randomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    var randomBoolean = function() {
        if(0 == parseInt(Math.random() * 2))
            return false;
        else
            return true;
    };

    //millis sleep
    var sleepFor = function( sleepDuration ){
        var now = new Date().getTime();
        while(new Date().getTime() < now + sleepDuration){ /* do nothing */ }
    }

    
    var fileToBase64 = function(file){
    	// read binary data
        let bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return new Buffer(bitmap).toString('base64');
    }
    
    var createRandomObj  = function(){
    	let p = {};
        p.id = uuid();
        p.name = randomString(24)
        p.price = randomNumber(500)
        p.category = randomString(24)
        p.subcategory = randomString(24)
        p.notes = randomString(24)
        p.images = []
        return p;
    }
    
    
    return {
        getPropertyNames: getPropertyNames
        , getPropertyArray: getPropertyArray
        , getPropertyNames: getPropertyNames
        , getPropertyValues: getPropertyValues
        , zeroPad: zeroPad
        , formatWeekOfYear: formatWeekOfYear
        , getProperties: getProperties
        , randomString: randomString
        , randomNumber: randomNumber
        , createUuid: createUuid
        , randomInt: randomInt
        , randomBoolean: randomBoolean
        , sleepFor: sleepFor
        , findPropertyIndexInArrayObj: findPropertyIndexInArrayObj
        , fileToBase64: fileToBase64
        , createRandomObj: createRandomObj
    };

}();

module.exports = CustomUtils;