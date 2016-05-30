var Cache = function(name){
	
	Module.call(this, name);
	this.config.requires = ['Utils', 'Constants', 'Api' ];
	this.cache = [];
	this.size = 128;
	this.config.collectionName = null;

	this.checkSize= function(){
		while(this.cache.length > this.size )
			this.cache.splice(0,1);
	};

	this.findObjIndex = function(id) {
		var result = -1;

		if(0 == this.cache.length)
			return result;
		
		for(i = this.cache.length-1 ; i >= 0; i--){
			var obj = this.cache[i]
			if(image.id == id){
				result = i;
				break;
			}
		}
		return result;
	};
	this.move2endAndGet = function(index){
		var result = this.cache[index];
		this.cache.splice(index, 1);
		this.cache.push(result);
		return result;
	};
	this.add2end = function(obj){
		this.cache.push(obj);
		this.checkSize();
	};
};

Cache.prototype.add = function(obj){
	this.add2end(obj);
};

Cache.prototype.getCollectionName = function(obj){
	return this.config.collectionName;
};

Cache.prototype = Object.create(Module.prototype);
Cache.prototype.constructor = Cache;

Cache.prototype.init = function(){
	Module.prototype.init.call(this);
	if(null != this.config.modules['constants'] && null != this.config.modules['constants'].cache_size)
		this.size = this.config.modules['constants'].cache_size;
};

Cache.prototype.get = function(id, callback){

	var index = this.findObjIndex(id);

	var localCallback = function(pointer, callback){
		var _pointer = pointer;
		var _callback = callback;

		var func = function(err, r){
			if(null != err)
				_callback(err);
			else {
				_pointer.add(r);
				_callback(null, r);
			}
			
		};
	}(this, callback);

	// if we have it in cache remove its index 
	if(-1 < index)
		this.config.modules['utils'].async(callback(null, this.move2endAndGet(index)));
	else {
		this.config.modules['utils'].api.get(this.getCollectionName(),id, localCallback.func);
	}

};

