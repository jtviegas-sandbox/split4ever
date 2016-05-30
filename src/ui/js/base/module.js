
/*
	basic module, should be extended by all ui classes
*/
var Module = function(name){
	this.name = name;
	// configuration related map, should be provided before start
	this.config = {
		requires: [] //string array with required mdule names
		, events: []
		, modules: {} // modules map: name -> mod
		, loggerLevel : 0
	}; 
	// context/state related map, to be used in run time
	this.context = {
		anchor_map : {}	
		, dollarMap: {}
	}; 

	this.logger = function(name, level){

		var print = function(message){
			console.log("[" + new Date().toUTCString() + " | " + name + "]"  + message);
		};

		// level 1
		var enter  = function(method){
			if( 1 >= level)
				print("<IN> " + method);
		};
		var leave  = function(method){
			if( 1 >= level)
				print("<OUT> " + method);
		};
		var trace  = function(msg){
			if( 1 >= level)
				print("<TRACE> " + msg);
		};
		// level 2
		var debug = function(msg){
			if( 2 >= level)
				print('<DEBUG> ' + msg);
		};
		//level 3
		var info = function(msg){
			if( 3 >= level)
				print('<INFO> ' + msg);
		};
		//level 4
		var warn = function(msg){
			if( 4 >= level)
				print('<WARNING> ' + msg);
		};

		var error = function(msg){
			print('<ERROR> ' + msg);
		};
		
		
		return {
			  in: enter
			, out: leave
			, trace: trace
			, debug: debug
			, info: info
			, error: error
			, warn: warn
		};


	}(this.name, this.config.loggerLevel);

}

/*
	sets up required modules, if the module is not yet loaded
	by APP global variable, load it and init it
	register to events on pubsub
*/
Module.prototype.init = function(){
	this.logger.in('init');
	if(null != this.config.requires ){

		for(i = 0; i < this.config.requires.length; i++){
			var requirement = this.config.requires[i];
			var moduleName = requirement.toLowerCase();
			var instance = null;
			//try to find the module in the global APP object
			instance = APP.findModule(requirement);
			if(null != instance){
				this.config.modules[moduleName] = instance;
				this.logger.debug('got module instance ' + moduleName + ' from APP global object!');
			}
			else {
				// if not provided by APP then lets create the module
				// and keep its reference with us, it is not global
				var classDefinition = classForName(requirement);
				if(null != classDefinition){
					instance = new classDefinition(moduleName);
					this.logger.debug('creating module instance ' + moduleName + ' from class');
					instance.init();
					this.logger.debug('called init on module instance ' + moduleName);
				}
				else
					this.throw('!!! could not find module: ' + requirement + ' !!!');
			}

			this.config.modules[moduleName] = instance;

			// if eventually this module is requiring pubsub then it is because
			// it want to register to receive its events
			if(moduleName == 'pubsub' && 0 < this.config.events.length ){
				//register events if necessary
				instance.subscribe(this.config.events, this);
				this.logger.debug('subscribed for events: ' + this.config.events);
			}
		}

	}
	this.logger.out('init');
};

/* cleanup code */
Module.prototype.shutdown = function(){
	this.logger.debug(this.name + ".shutdown is not implemented");
};
/* start module main functionality */
Module.prototype.start = function(){
	this.logger.debug(this.name + ".run is not implemented");
};
/* stop module functionality */
Module.prototype.stop = function(){
	this.logger.debug(this.name + ".halt is not implemented");
};
/* reacts to events from the pubsub module, or any other event producing module for that matter */
Module.prototype.onEvent = function(event,context){
	this.logger.debug(this.name + ".onEvent is not implemented");
};
/* get map of jquery dom pointers */
Module.prototype.getDollarMap = function(){
	return this.context.dollarMap;
};

Module.prototype.getName = function(){
	return this.name;
};

Module.prototype.getContext = function(context){
	return this.context;
};

Module.prototype.throw = function(msg){
	throw new Error( "origin: " + this.name + " | msg: " + msg );
};

/* add entry to existing dollar map */
Module.prototype.add2DollarMap = function(key, val){
	this.logger.in('add2DollarMap');
	Object.defineProperty(this.context.dollarMap, key, { value: val });
	this.logger.out('add2DollarMap');
};

/* add entry to existing context map */
Module.prototype.add2Context = function(key, val){
	this.logger.in('add2Context');
	Object.defineProperty(this.context, key, { value: val });
	this.logger.out('add2Context');
};

/* add provided context map entries to existing context map */
Module.prototype.addContext = function(ctxMap){
	this.logger.in('addContext');
	for (var key in ctxMap) {
	  if (ctxMap.hasOwnProperty(key)) {
	    Object.defineProperty(this.context, key, { value: ctxMap[key] });
	  }
	}
	this.logger.out('addContext');
};

/* add provided configuration map entries to existing config map */
Module.prototype.addConfiguration = function(confMap){
	this.logger.in('addConfiguration');
	for (var key in confMap) {
	  if (confMap.hasOwnProperty(key)) {
	    Object.defineProperty(this.config, key, { value: confMap[key]} );
	  }
	}
	this.logger.out('addConfiguration');
};
