var Item = function(name){
	Module.call(this, name);
	this.config.requires = ['Utils', 'PubSub', 'Constants', 'ItemUi' ];
	this.config.events = ['onBody'];
};

Item.prototype = Object.create(Module.prototype);
Item.prototype.constructor = Item;


/*Item.prototype.start = function(){
	this.logger.in('start');

	this.config.modules['itemui'].init();
	

	this.logger.out('start');
};
*/
Item.prototype.onEvent = function(event,ctx){
	this.logger.in('onEvent');
	var itemui = this.config.modules['itemui'];

	if(event == "onBody" && null != ctx.body && "item" == ctx.body ) {

		this.context.mode = this.config.modules['constants'].uiMode.view;
		this.context.dollarMap = ctx.dollarMap;

		if(null != ctx.id){
			this.context.id = ctx.id;
			this.context.mode = this.config.modules['constants'].uiMode.edit;	
		}
		
		//TODO remove -> just for testing
		this.context.id = 0;

		itemui.add2DollarMap('$body', this.context.dollarMap.$body);
		itemui.add2Context('mode', this.context.mode);

		itemui.start();

		//now we have itemui dollarmap to do the bindings

	}

	this.logger.out('onEvent');
};