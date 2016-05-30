
var Browser = function(name){
	Module.call(this, name);
	this.config.requires = ['Utils', 'PubSub', 'Constants', 'ItemBrowser' ];
	this.config.events = [ 'onBody' ];
	this.config.anchor_schema_map = {};
	this.context.anchor_map = {};
};

Browser.prototype = Object.create(Module.prototype);
Browser.prototype.constructor = Browser;

Browser.prototype.onEvent = function(event,context){
	this.logger.in(this.config.modules['utils'].printf('onEvent [ event: %s, context: %s ]', [event, JSON.stringify(context)]));
	if(event == "onBody" && null != context.body && context.body == "browser"){

		this.add2DollarMap($body, context.dollarMap.$body);

	}
	this.logger.out('onEvent');
};

Browser.prototype.start = function(){
	this.logger.in('start');

	var callback = function(mod) {
		var f = function(err, item){
			if(null != err)
				mod.logger.error('problem getting items to display: ' + JSON.stringify(err));
			else {
				mod.display(item);
			}
		};
		return { f: f };
	}(this);

	//CACHE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1


	this.logger.out('start');
};

Browser.prototype.display = function(item){
	this.logger.in('display');
	this.context.dollarMap.$body.append(this.config.modules['itembrowser'].asWidget(item));
	this.logger.out('display');
};