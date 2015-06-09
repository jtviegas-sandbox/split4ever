var Header = (function(){

	var module = function(name){
		common.UIMod.call(this,name);
		this.configMap = {
			events: ['onBody'],
			requires: [],
			api : null,
			main_html : '<div class="row">' +
					'<div class="col-sm-8" id="headerdiv1">' + 
					'</div>' +
					'<div class="col-sm-3" id="headerdiv2">' +
					'</div>' +
					'<div class="col-sm-1" id="headerdiv3">' +
					'</div>' +
				'</div>' 
		};
		this.stateMap = {
			anchor_map : {},
			jqueryMap : {}	, 
			gui: null
		}; 
		
	};

	module.prototype = Object.create(common.UIMod.prototype);
	module.prototype.constructor = module;
	
	module.prototype.setJqueryMap = function($container){

		this.stateMap.jqueryMap = {
			$container : $container,
			$hd1 : $container.find('#headerdiv1'),
			$hd2: $container.find('#headerdiv2'),
			$hd3: $container.find('#headerdiv3')
		};

	};

	module.prototype.setGuiState = function(state) {

		if(1 > this.stateMap.jqueryMap.$hd1.children().length){
			//'<img src="img/header.png" class="img-rounded"/>' + 
			var imgWidget = document.createElement("img");
			imgWidget.setAttribute("src","img/header.png");
			imgWidget.classList.add("img-rounded");
			this.stateMap.jqueryMap.$hd1.append(imgWidget);
		}

		if(state == this.stateMap.gui){
			//do nothing
		}
		else if( state == 'item' ) {
			this.stateMap.jqueryMap.$hd2.empty();
			this.stateMap.jqueryMap.$hd3.empty();
			this.stateMap.gui = state;

		}
		else { //browse
			//<input type="text" class="form-control" id="search" placeholder="..."/>'
			// <button type="submit" class="btn btn-default">search</button>'
			this.stateMap.jqueryMap.$hd2.empty();
			this.stateMap.jqueryMap.$hd3.empty();
			this.stateMap.gui = state;

			var searchTextWidget = document.createElement("input");
			searchTextWidget.setAttribute("type","text");
			searchTextWidget.setAttribute("id","search");
			searchTextWidget.setAttribute("placeholder","...");
			searchTextWidget.classList.add("form-control");
			searchTextWidget.classList.add("pull-right");
			this.stateMap.jqueryMap.$hd2.append(searchTextWidget);

			var btnWidget = document.createElement("button");
			btnWidget.setAttribute("type","submit");
			btnWidget.classList.add("btn");
			btnWidget.classList.add("btn-default");
			btnWidget.classList.add("pull-right");
			btnWidget.textContent = "search";
			this.stateMap.jqueryMap.$hd3.append(btnWidget);
		}
		
	} ;

	module.prototype.onEvent = function(event, data){

		if(event == "onBody"){
			this.setGuiState(data.body)
		}
		

	};




	module.prototype.setEvents = function(){
/*		this.stateMap.jqueryMap.$msg.click(function(){
			alert("msg")
		});*/
	};

	return { module: module };

}());