var Config = function() {

	return { 
		app: {
			name: 'split4ever'
			, db : {
				credentials: {
					user: 'joaovieg'
					, pswd: 'R0m3L*20!5'
				}
				, instances: [
					{
						name: 'part'
						, designDoc: {
					      "_id": "_design/part"
					      , "language": "javascript"
					      , "views": {
						      	 "categories" : {
						      		"map": "function(doc) { \
						      					emit(doc.category, doc.subCategory); \
						      					}"
									, "reduce": "function(key, values, rereduce) { \
                           				var r = []; \
                           				var flatten = function(arr){ \
                              				var result = []; \
											  for(var i=0; i<arr.length; i++){ \
												var o = arr[i]; \
												if( Array.isArray(o) ) \
													Array.prototype.push.apply(result, flatten(o)); \
												else \
													result.push(o); } \
												return result; }; \
											var flattened = flatten(values); \
											for(var i=0; i<flattened.length; i++){ \
											  	var n = flattened[i]; \
											  	if(0 > r.indexOf(n)){ \
											     	r.push(n); } } \
											return r;}"
						      	}
						      	, "models" : {
                                    "map": "function(doc) { \
                                                    if(doc.model){ \
                                                        emit(doc.model, 1); \
                                                    }}"
                                    , "reduce": "_count"
							}
					      } 
					  	}
					}
				]
			}
		}
	};
}();

module.exports = Config;
