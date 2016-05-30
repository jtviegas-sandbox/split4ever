var ItemWgt = function(name){
	Module.call(this, name);
	this.config.requires = ['Utils', 'Constants' ];

	// we are gonna use these
	this.context.mode = null;
	this.context.dollarMap = {};
};

ItemWgt.prototype = Object.create(Module.prototype);
ItemWgt.prototype.constructor = ItemWgt;

ItemWgt.prototype.start = function(){
	this.logger.in('start');

	this.context.dollarMap.$body.append(this.asWidget());
	this.doDollarMap();

	this.logger.out('start');
}

ItemWgt.prototype.doDollarMap = function(){
	this.logger.in('doDollarMap');

	this.context.dollarMap = {
		$container : this.context.dollarMap.$body.find('#itemui')[0]
		,$save : $(this.context.dollarMap.$container).find('#xSave')[0]
		,$delete : $(this.context.dollarMap.$container).find('#xDelete')[0]
	};

	this.logger.out('doDollarMap');
}

ItemWgt.prototype.asWidget = function(){

	this.logger.in('asWidget');
  
	var editMode = ( (null != this.context.mode) && (this.context.mode == this.config.modules['constants'].uiMode.edit) );
	var utils = this.config.modules['utils'];

	var divContainer = utils.createElement('div',['container'], [{ name:"id", value:"itemui"}]);
	var divPart = utils.createElement('div',['twelve', 'columns'], [{ name:"id", value:"part"}]);
	divContainer.appendChild(divPart);
	var form = utils.createElement('form');
	divPart.appendChild(form);

	var row1 = utils.createElement('div',['row']);
	form.appendChild(row1);
	var divName = utils.createElement('div',['eight', 'columns'], [{ name: "v-bind:class", value: "{ 'error': !validation.name }"}]);
	row1.appendChild(divName);
	var labelName = utils.createElement('label',[], [{ name: "for", value: "xName"}]);
	labelName.innerText = 'name';
	divName.appendChild(labelName);
	var wgtName = null;
	if(editMode)
		wgtName = utils.createElement('input',["u-full-width"], [{ name: "type", value:"text"}, { name: "placeholder", value: "..."}, { name: "id", value: "xName"}, { name: "v-model", value: "item.name"}]);
	else
		wgtName = utils.createElement('label',["u-full-width"], [{ name: "id", value: "xName"}, { name: "v-model", value: "item.name"}]);
	
	divName.appendChild(wgtName);
	var divPrice = utils.createElement('div',['four', 'columns'], [{ name: "v-bind:class", value:"{ 'error': !validation.price}"}]);
	row1.appendChild(divPrice);
	var labelPrice = utils.createElement('label',[], [{ name: "for", value:"xPrice"}]);
	labelPrice.innerText = 'price €';
	divPrice.appendChild(labelPrice);
	var wgtPrice = null;
	if(editMode)
		wgtPrice = utils.createElement('input',["u-full-width"], [{ name: "type",  value: "number"}, { name: "placeholder", value: '__ €'}, { name: "id", value: "xPrice"}, { name: "v-model", value:"item.price"}]);
	else
		wgtPrice = utils.createElement('label',["u-full-width"], [{ name: "id", value: "xPrice"}, { name: "v-model", value:"item.price"}]);
	divPrice.appendChild(wgtPrice);
	
	var row2 = utils.createElement('div',['row']);
	form.appendChild(row2);
	var divCategory = utils.createElement('div',['six', 'columns'], [{ name: "v-bind:class", value: "{ 'error': !validation.category }"}]);
	row2.appendChild(divCategory);
	var labelCategory = utils.createElement('label',[], [{ name: "for", value:"xCategory"}]);
	labelCategory.innerText = 'category';
	divCategory.appendChild(labelCategory);
	var wgtCategory = null;
	if(editMode)
		wgtCategory = utils.createElement('select',["u-full-width"], [ { name: "id", value: "xCategory"}, { name: "v-model", value:"item.category"}]);
	else
		wgtCategory = utils.createElement('label',["u-full-width"], [ { name: "id", value: "xCategory"}, { name: "v-model", value:"item.category"}]);
	divCategory.appendChild(wgtCategory);
	var divSubCategory = utils.createElement('div',['six', 'columns'], [{ name: "v-bind:class", value: "{ 'error': !validation.subCategory }"}]);
	row2.appendChild(divSubCategory);
	var labelSubCategory = utils.createElement('label',[], [{ name: "for", value:"xSubCategory"}]);
	labelSubCategory.innerText = 'subCategory';
	divSubCategory.appendChild(labelSubCategory);
	var wgtSubCategory = null;
	if(editMode)
		wgtSubCategory = utils.createElement('select',["u-full-width"], [ { name: "id", value: "xSubCategory"}, { name: "v-model", value:"item.subCategory"}]);
	else
		wgtSubCategory = utils.createElement('label',["u-full-width"], [ { name: "id", value: "xSubCategory"}, { name: "v-model", value:"item.subCategory"}]);
	divSubCategory.appendChild(wgtSubCategory);

	var row3 = utils.createElement('div',['row']);
	form.appendChild(row3);
	var divNotes = utils.createElement('div',['twelve', 'columns'], [{ name: "v-bind:class", value: "{ 'error': !validation.notes }"}]);
	row3.appendChild(divNotes);
	var labelNotes = utils.createElement('label',[], [{ name: "for", value:"xNotes"}]);
	labelNotes.innerText = 'notes';
	divNotes.appendChild(labelNotes);
	var wgtNotes= null;
	if(editMode)
		wgtNotes = utils.createElement('textarea',["u-full-width"], [ { name: "id", value: "xNotes"}, { name: "v-model", value:"item.notes"}]);
	else
		wgtNotes = utils.createElement('label',["u-full-width"], [ { name: "id", value: "xNotes"}, { name: "v-model", value:"item.notes"}]);
	divNotes.appendChild(wgtNotes);

	var row4 = utils.createElement('div',['row']);
	form.appendChild(row4);
	var divId = utils.createElement('div');
	row4.appendChild(divId);
	var inputId = utils.createElement('input',null, [{ name: "type",  value: "number"}, { name: "id", value: "xId"}, { name: "v-model", value:"item._id"}, { name: "style", value:"display: none;"}]);
	divId.appendChild(inputId);
	var divImageIds = utils.createElement('div');
	row4.appendChild(divImageIds);
	var listImageIds = utils.createElement('ul', null, [ { name: "id", value: "xImageIds"}, { name: "style", value:"display: none;"}]);
	divImageIds.appendChild(listImageIds);
	var itemImageIds = utils.createElement('li', null, [ { name: "v-for", value: "imageId in item.images"}, { name: "transition", value:""}]);
	listImageIds.appendChild(itemImageIds);
	var spanImageIds = utils.createElement('span');
	spanImageIds.innerText = '{{imageId}}';
	itemImageIds.appendChild(spanImageIds);

	if(editMode){
		var row5 = utils.createElement('div',['row']);
		form.appendChild(row5);
		var divButtons = utils.createElement('div',['twelve', 'columns']);
		row5.appendChild(divButtons);
		var buttonDelete = utils.createElement('button', ["u-max-full-width"], [{ name: "id", value: "xDelete"}]);
		buttonDelete.innerText = 'delete';
		divButtons.appendChild(buttonDelete);
		var buttonSave = utils.createElement('button', ["u-max-full-width", "u-pull-right"], 
			[ { name: "v-bind:disabled", value: "!isValid"}, { name: "v-bind:class", value:"{ 'btn-disable': !isValid }"} , { name: "id", value: "xSave"}]);
		buttonSave.innerText = 'save';
		divButtons.appendChild(buttonSave);
	}

	this.logger.out('asWidget');
	return divContainer;
};
