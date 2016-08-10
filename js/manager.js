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
			start: function () {
				var
					TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
					SettingsView = require('modules/%ModuleName%/js/views/SettingsView.js')
				;
				SettingsView.registerTab(function () { return require('modules/%ModuleName%/js/views/CommonSettingsPaneView.js'); },
					'common',
					TextUtils.i18n('%MODULENAME%/LABEL_COMMON_SETTINGS_TAB'));
//				SettingsView.registerTab(function () { return null; },
//					'modules',
//					TextUtils.i18n('%MODULENAME%/LABEL_MODULES_SETTINGS_TAB'));
			},
			getScreens: function () {
				var oScreens = {};
				oScreens[Settings.HashModuleName] = function () {
					return require('modules/%ModuleName%/js/views/SettingsView.js');
				};
				return oScreens;
			},
			registerAdminPanelTab: function (fGetTabView, oTabName, oTabTitle) {
				var SettingsView = require('modules/%ModuleName%/js/views/SettingsView.js');
				SettingsView.registerTab(fGetTabView, oTabName, oTabTitle);
			}
		};
	}
	
	return null;
};