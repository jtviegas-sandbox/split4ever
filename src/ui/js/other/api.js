var Api = function(name){
	Module.call(this, name);
	this.config.requires = ['Utils', 'Constants' ];

	this.origin = window.location.origin + '/api/collections/';

	this.localCallback = function(callback){
		var _callback = callback;

		var ok = function(o){
			return _callback(null, o);
		};
		var nok = function(o){
			return _callback(new Error(o));
		};

		return {
			ok: ok,
			nok: nok
		};
	};

};

Api.prototype = Object.create(Module.prototype);
Api.prototype.constructor = Api;

Api.prototype.set = function(collectionName, obj, callback){
	this.logger.in('set');

	var url = this.origin + collectionName; 
	var _callback = new this.localCallback(callback);
	$.ajax({
		async:true,
	    url: url,
	    data: obj,
	    type: 'POST',
	    success: _callback.ok,
	    dataType: 'json',
	    error: _callback.nok
	});
	this.logger.out('set');
};

Api.prototype.getAll = function(collectionName, callback){
	this.logger.in('getAll');

	var url = this.origin + collectionName + '/all'; 
	var _callback = new this.localCallback(callback);
	$.ajax({
		async:true,
	    url: url,
	    type: 'GET',
	    success: _callback.ok,
	    dataType: 'json',
	    error: _callback.nok
	});
	this.logger.out('getAll');
};

Api.prototype.get = function(collectionName, id, callback){
	this.logger.in('get');

	var url = this.origin + collectionName + "/" + id; 
	var _callback = new this.localCallback(callback);
	$.ajax({
		async:true,
	    url: url,
	    type: 'GET',
	    success: _callback.ok,
	    dataType: 'json',
	    error: _callback.nok
	});
	this.logger.out('get');
};

Api.prototype.del = function(collectionName, id, callback){
	this.logger.in('del');

	var url = this.origin + collectionName + "/" + id; 
	var _callback = new this.localCallback(callback);
	$.ajax({
		async:true,
	    url: url,
	    type: 'DELETE',
	    success: _callback.ok,
	    dataType: 'json',
	    error: _callback.nok
	});
	this.logger.out('del');
};
