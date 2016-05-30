
var UiShell = function(name){
	Module.call(this, name);
	this.config.requires = ['Utils', 'PubSub', 'Constants' ];
	this.config.anchor_schema_map = {};
	this.context.anchor_map = {};
};

UiShell.prototype = Object.create(Module.prototype);
UiShell.prototype.constructor = UiShell;

UiShell.prototype.start = function(){
	this.logger.in('start');

	var callback = function(ctx, cfg, lgg) {

		var onChange = function(event) {
			var anchor_map_previous = $.extend(true, {}, ctx.anchor_map);
			var anchor_map_proposed;
			//#!page=profile:uname,wendy|online,today&slider=confirm:text,hello|pretty,false&color=red 
			//#!body=browse:text,amortecedores
			try { // attempt to parse anchor
				anchor_map_proposed = $.uriAnchor.makeAnchorMap();
				lgg.debug('proposed anchor: ' + anchor_map_proposed.body);  
			} catch (error) { // if we can't parse it we take the previous one
				lgg.error('!!! couldnt parse the anchor: ' + error.toString() + ' !!!');
				$.uriAnchor.setAnchor(anchor_map_previous, null, true);
				return false;
			}
			ctx.anchor_map = anchor_map_proposed;
			lgg.debug('...setting anchor_map: ' + JSON.stringify(ctx.anchor_map));
			//so we have an anchor map, if no body then set body to browser module by default
			if(null == ctx.anchor_map.body){
				lgg.debug('going to use default anchor map'); 
				$.uriAnchor.setAnchor( cfg.modules['constants'].defaultAnchorMap );
				return false;
			};

			// if not we create and broadcast a context obj with the dollarMap 
			// elements and the body values for whoever might be interested
			var _ctx = {};
			_ctx = cfg.modules['utils'].copyObjProps2Obj(ctx.anchor_map['_body'], _ctx);
			_ctx['body']=ctx.anchor_map.body;

			//lets first clean body from its ui children as it is going to be re-created
			ctx.dollarMap.$body.empty();
			_ctx['dollarMap']= { $body: ctx.dollarMap.$body };
			cfg.modules['pubsub'].publish('onBody', _ctx);
			return false;
		};
		return {
			onChange: onChange
		};

	}( this.context, this.config, this.logger );

	this.logger.info('triggering initial hashchange');
	$(window).bind('hashchange', callback.onChange ).trigger('hashchange');
	$.uriAnchor.makeAnchorMap();

	this.logger.out('start');
};



