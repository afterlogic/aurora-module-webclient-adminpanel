'use strict';

module.exports = function (oAppData, iUserRole, bPublic) {
	if (iUserRole === Enums.UserRole.SuperAdmin)
	{
		var
			Settings = require('modules/%ModuleName%/js/Settings.js'),
			oSettings = oAppData['%ModuleName%'] || {}
		;

		Settings.init(oSettings);

		return {
			getScreens: function () {
				var oScreens = {};
				oScreens[Settings.HashModuleName] = function () {
					return require('modules/%ModuleName%/js/views/SettingsView.js');
				};
				return oScreens;
			},
			getHeaderItem: function () {
				var
					TextUtils = require('modules/CoreClient/js/utils/Text.js'),
					CHeaderItemView = require('modules/CoreClient/js/views/CHeaderItemView.js')
				;
				return {
					item: new CHeaderItemView(TextUtils.i18n('CORECLIENT/HEADING_SETTINGS_TABNAME')),
					name: Settings.HashModuleName
				};
			},
			registerAdminPanelTab: function (fGetTabView, oTabName, oTabTitle) {
				var SettingsView = require('modules/%ModuleName%/js/views/SettingsView.js');
				SettingsView.registerTab(fGetTabView, oTabName, oTabTitle);
			},
			getAbstractAdminPanelFormViewClass: function () {
				return require('modules/%ModuleName%/js/views/CAbstractSettingsFormView.js');
			}
		};
	}
	
	return null;
};
