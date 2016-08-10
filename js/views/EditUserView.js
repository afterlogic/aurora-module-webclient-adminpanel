'use strict';

var
	ko = require('knockout'),
	
	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js')
;

/**
 * @constructor
 */
function CEditUserView()
{
	this.sHeading = TextUtils.i18n('%MODULENAME%/HEADING_CREATE_USER');
	this.id = ko.observable(0);
	this.name = ko.observable('');
	this.aRoles = [
		{text: TextUtils.i18n('%MODULENAME%/LABEL_ADMINISTRATOR'), value: Enums.UserRole.SuperAdmin},
		{text: TextUtils.i18n('%MODULENAME%/LABEL_USER'), value: Enums.UserRole.PowerUser},
		{text: TextUtils.i18n('%MODULENAME%/LABEL_GUEST'), value: Enums.UserRole.RegisteredUser}
	];
	this.role = ko.observable(Enums.UserRole.PowerUser);
}

CEditUserView.prototype.ViewTemplate = '%ModuleName%_EditUserView';

CEditUserView.prototype.getCurrentValues = function ()
{
	return [
		this.id(),
		this.name(),
		this.role()
	];
};

CEditUserView.prototype.clearFields = function ()
{
	this.id(0);
	this.name('');
	this.role(Enums.UserRole.PowerUser);
};

CEditUserView.prototype.parse = function (iEntityId, oResult)
{
	if (oResult)
	{
		this.id(iEntityId);
		this.name(oResult.Name);
		this.role(oResult.Role);
	}
	else
	{
		this.clearFields();
	}
};

CEditUserView.prototype.getParametersForSave = function ()
{
	return {
		Id: this.id(),
		Name: this.name(),
		Role: this.role()
	};
};

module.exports = new CEditUserView();