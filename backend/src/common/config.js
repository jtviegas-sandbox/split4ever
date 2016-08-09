var Config = function() {

	return { 
		app: {
			name: 'split4ever'
			, db : {
				credentials: {
					user: 'joaovieg'
					, pswd: '_'
				}
				, instances: [
					{
						name: 'part'
						, designDoc: {
					      "_id": "_design/part"
					      , "language": "javascript"
					      , "views": {
					      	"tags" : {
					      		"map": "function(doc) { \
					      					if(Array.isArray(doc.tags) && 0 < doc.tags.length) { \
						      					doc.tags.forEach( \
						      						function(e){ \
						      							if(null != e.text){ \
						      								emit(e.text, 1); \
						      							} \
						      						} \
					      						) \
					      					};  }"
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

