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
								'name': 'datasource' 
								, 'map': "function(doc) { emit(doc._id, doc); }"
							} 
						]
					}
					, { 
						name: 'tag' 
					}
				]
			}
		}
	};
}();

module.exports = Config;
