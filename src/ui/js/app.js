var App = function(name){
	Module.call(this, name);
	this.config.requires = ['Utils'];
};

App.prototype = Object.create(Module.prototype);
App.prototype.constructor = App;

/* app should be a singleton, so it should load the default
	modules, without trying to find if they are loaded anywhere else
 */
App.prototype.init = function(){
	this.logger.in('init');

	if(null != this.config.requires ){

		for(i = 0; i < this.config.requires.length; i++){
			var requirement = this.config.requires[i];
			var instance = null;
			//load the module from the class
			var classDefinition = classForName(requirement);
			if(null != classDefinition){
				instance = new classDefinition(requirement.toLowerCase());
				this.logger.debug('creating module instance '+ requirement + " from class");
				this.config.modules[requirement.toLowerCase()] = instance;
			}
			else
				this.throw('!!! could not find module:' + requirement + ' !!!');
		}
	}
	
	//init all the modules now
	for( modName in this.config.modules){
		if(this.config.modules.hasOwnProperty(modName)){
			var module = this.config.modules[modName];
			module.init();
			this.logger.debug('called init on module instance '+ modName);
		}
	}
	this.logger.out('init');
};

App.prototype.findModule = function(modName){
	var result = null;
	var moduleName = modName.toLowerCase();
	if(this.config.modules.hasOwnProperty(moduleName))
		result = this.config.modules[moduleName];
	return result;
};

/*
	create the default dollar map
*/
App.prototype.createDollarMap = function(){
	this.logger.in('createDollarMap');
	var container = $( this.context.container );
	this.context.dollarMap = {
		$header : container.find('#header'),
		$body : container.find('#body'),
		$footer : container.find('#footer')
	};
	this.logger.out('createDollarMap');
};

/*
	create the initial structure of the page html, 
	with 3 divs: header, body and footer
*/
App.prototype.createScaffold = function(){

	this.logger.in('createScaffold');

	if( null == this.context.container )
		this.throw('!!! we need a container to load the bootstrap modules !!!');

	var utils = this.config.modules['utils'];
	var container = $( this.context.container );

	var headerDiv = utils.createElement('div', null, [ { name: 'id', value: 'header' } ]);
	var bodyDiv = utils.createElement('div', null, [ { name: 'id', value: 'body' } ]);
	var footerDiv = utils.createElement('div', null, [ { name: 'id', value: 'footer' } ]);

	container.append(headerDiv);
	container.append(bodyDiv);
	container.append(footerDiv);

	this.logger.out('createScaffold');
};

/*
	start app
	...once we've init'ed and received all the neeeded info (container, bootstrap modules),
	we should create the page structure and start the bootstrap modules
*/
App.prototype.start = function(){
	this.logger.in('start');
	
	this.createScaffold();
	this.createDollarMap();

	if( null == this.context.bootstrapModules 
		|| (!Array.isArray(this.context.bootstrapModules)) 
		|| (1 > this.context.bootstrapModules.length) )
		this.throw('!!! we need an array of botstrap modules !!!');

	for(i=0; i < this.context.bootstrapModules.length; i++){
		var modName = this.context.bootstrapModules[i];
		var bootstrapMod = this.config.modules[modName];
		if( null == bootstrapMod)
			this.throw('!!! botstrap module not previously loaded: ' + modName + '!!!');

		// TODO asynch
		bootstrapMod.addContext({ dollarMap: this.context.dollarMap });
		bootstrapMod.start();
		this.logger.debug('called run on module instance '+ modName);
	}
	this.logger.out('start');
};
