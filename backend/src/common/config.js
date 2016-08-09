var Config = function() {

	return { 
		app: {
			name: 'split4ever'
			, db : {
				credentials: {
					user: 'joaovieg'
					, pswd: 'Carr!eg0'
				}
				, instances: [
					{
						name: 'part'
						, views: [
							{ 
								'name': 'tags' 
								, 'map': "function(doc) { emit(doc._id, doc.tags); }"
								, 'reduce': "function(keys, values, rereduce){ \
												if (rereduce){ \
													return sum(values); \
									    		} else { \
									        		return sum(values); } }"
							} 
						]
					}
				]
			}
		}
	};
}();

module.exports = Config;
