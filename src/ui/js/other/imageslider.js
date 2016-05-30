var ImageSlider = function(name){
	Module.call(this, name);
	//this.config.requires = ['Utils'];
	//this.config.events = ['onBody'];

	var createContainer = function(){
		var containerDiv = document.createElement("div");
		containerDiv.classList.add('imageslider_container');
		var controlsDiv = document.createElement("div");
		containerDiv.appendChild(controlsDiv);
		controlsDiv.classList.add('imageslider_controls');
 		var leftSpan = document.createElement("span");
		controlsDiv.appendChild(leftSpan);
 		var windowDiv = document.createElement("div");
 		containerDiv.appendChild(windowDiv);
		windowDiv.classList.add('imageslider_window');
		var stripDiv = document.createElement("div");
		windowDiv.appendChild(stripDiv);
		stripDiv.classList.add('imageslider_strip');
		var controls2Div = document.createElement("div");
		containerDiv.appendChild(controls2Div);
		controls2Div.classList.add('imageslider_controls');
 		var rightSpan = document.createElement("span");
		controlsDiv.appendChild(rightSpan);

		this.context.dollarMap.$container = $('div.imageslider_container');
		this.context.dollarMap.$strip = $('div.imageslider_strip');
		this.context.dollarMap.$window = $('div.imageslider_window');

	};
};

ImageSlider.prototype = Object.create(Module.prototype);
ImageSlider.prototype.constructor = ImageSlider;

ImageSlider.prototype.init = function(){
	Module.prototype.init.call(this);
	

};

Item.prototype.start = function(){
	this.logger.in('start');

	if(null == this.context.images || (!Array.isArray(this.context.images)) )
		this.throw('!!! must provide an array of images !!!');
	if(null == this.context.slideWindowSize)
		this.throw('!!! must provide slideWindowSize !!!');
	if(null == this.context.dollarMap.$body)
		this.throw('!!! must provide $body !!!');

	var stripWidth = 0;
	this.context.dollarMap.$window.css('width', '' + this.context.slideWindowSize + 'px');

	for(var i = 0; i < this.context.images.size; i++){
		var imgDiv = document.createElement("div");
	    imgDiv.classList.add('id', 'imageslider_frame');
	    imgDiv.style.width = '' + IMG_WIDTH + 'px';
	    $slider.append(imgDiv);
	    var img = images[0];
	    var imgWidget = document.createElement("img");
	    imgWidget.src = img.data;
	    imgDiv.appendChild(imgWidget);
 		window.getComputedStyle(imgDiv,null).getPropertyValue("width");
	}


	this.logger.out('start');
};

