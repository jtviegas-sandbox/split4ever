
var classForName = function(clazz){

	type = "function";  // can pass "function"
    var arr = clazz.split(".");

    var o = (window || this);
    for (var i = 0; i < arr.length; i++) {
        o = o[arr[i]];
    }
    if (typeof o !== type) {
        throw new Error(type +" not found: " + clazz);
    }

    return  o;
}

var APP = new function(){

	var running = false;
	var appModulesConf = { requires: [ 'Utils', 'Constants', 'PubSub', 
		'UiShell', 'Header', 'Footer', 'Browser' ] };
	var bootContext = { bootstrapModules: ['uishell', 'header', 'footer'] };
	var app = new App('app');
	app.addConfiguration(appModulesConf);
	app.addContext(bootContext);

	var run = function(ctx){
		if(running)
			throw new Error("!!! Already running !!!");
		app.init();
		app.addContext(ctx);
		app.start();
		running = true;	
	};

	var findModule = function(name){
		return app.findModule(name);
	};

	return {
		run: run ,
		findModule : findModule
	};

}();