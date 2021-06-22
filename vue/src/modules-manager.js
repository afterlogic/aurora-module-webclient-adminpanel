import _ from 'lodash'

import typesUtils from 'src/utils/types'

import moduleList from 'src/modules'

let allModules = null
let allModulesNames = []
let systemTabs = null
let userTabs = null

function _checkIfModuleAvailable (module, modules, availableModules, depth = 1) {
  if (depth > 4) {
    return true // to prevent infinite recursion if some modules require each other for some reason
  }
  const isAvailable = availableModules.indexOf(module.moduleName) !== -1
  const isEveryRequireAvailable = _.isArray(module.requiredModules)
    ? module.requiredModules.every(requiredModuleName => {
      const requiredModule = modules.find(module => {
        return module.moduleName === requiredModuleName
      })
      return requiredModule
        ? _checkIfModuleAvailable(requiredModule, modules, availableModules, depth + 1)
        : availableModules.indexOf(requiredModuleName) !== -1
    })
    : true
  return isAvailable && isEveryRequireAvailable
}

export default {
  async getModules (appData) {
    if (allModules === null) {
      const availableClientModules = typesUtils.pArray(appData?.Core?.AvailableClientModules)
      const availableBackendModules = typesUtils.pArray(appData?.Core?.AvailableBackendModules)
      const availableModules = _.uniq(availableClientModules.concat(availableBackendModules))
      let modules = await moduleList.getModules()
      if (_.isArray(modules)) {
        modules = modules.map(module => {
          return _.isObject(module.default) ? module.default : null
        })
        allModules = modules.filter(module => {
          if (_.isObject(module)) {
            return _checkIfModuleAvailable(module, modules, availableModules)
          }
          return false
        })
        allModulesNames = allModules.map(module => {
          return module.moduleName
        })
      } else {
        allModules = []
        allModulesNames = []
      }
    }
  },

  initModules (appData) {
    _.each(allModules, oModule => {
      if (_.isFunction(oModule.init)) {
        oModule.init(appData)
      }
    })
  },

  getAdminSystemTabs () {
    if (systemTabs === null && allModules !== null) {
      systemTabs = []
      _.each(allModules, oModule => {
        const aModuleSystemTabs = _.isFunction(oModule.getAdminSystemTabs) && oModule.getAdminSystemTabs()
        if (_.isArray(aModuleSystemTabs)) {
          systemTabs = systemTabs.concat(aModuleSystemTabs)
        }
      })
    }
    return systemTabs === null ? [] : systemTabs
  },

  getAdminUserTabs () {
    if (userTabs === null && allModules !== null) {
      userTabs = []
      _.each(allModules, oModule => {
        const aModuleSystemTabs = _.isFunction(oModule.getAdminUserTabs) && oModule.getAdminUserTabs()
        if (_.isArray(aModuleSystemTabs)) {
          userTabs = userTabs.concat(aModuleSystemTabs)
        }
      })
    }
    return userTabs === null ? [] : userTabs
  },

  isModuleAvailable (moduleName) {
    return allModulesNames.indexOf(moduleName) !== -1
  },
}
