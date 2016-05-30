
var Constants = function(name){
		Module.call(this, name);
};

Constants.prototype = Object.create(Module.prototype);
Constants.prototype.constructor = Constants;

Constants.prototype.nameMaxLength = 128;
Constants.prototype.amountMax = 999999;
Constants.prototype.notesMaxLength = 1024;
Constants.prototype.newCategoryToken = '*** new category ***';
Constants.prototype.newSubCategoryToken = '*** new sub category ***';
Constants.prototype.noCategoryToken = '';
Constants.prototype.noSubCategoryToken = '';
Constants.prototype.notAvailableToken = 'not available';
Constants.prototype.allClauseToken = '*';
Constants.prototype.newSubCategoryPrompt = 'please provide a new sub category: ';
Constants.prototype.newCategoryPrompt = 'please provide a new category: ';
Constants.prototype.delFilesPrompt = 'You are sure you want to delete files?';

Constants.prototype.defaultAnchorMap = { body : 'browser' , _body : {searchtext   : ''} };
Constants.prototype.uiMode = { view : 0 , edit: 1 };
Constants.prototype.cache_size = 128;

