import _ from 'lodash'

import errors from 'src/utils/errors'
import notification from 'src/utils/notification'
import typesUtils from 'src/utils/types'
import webApi from 'src/utils/web-api'

import UserModel from 'src/classes/user'

let users = []

export default {
  getUsers (tenantId, search, page, limit) {
    return new Promise((resolve, reject) => {
      users = []
      webApi.sendRequest({
        moduleName: 'Core',
        methodName: 'GetUsers',
        parameters: {
          TenantId: tenantId,
          Search: search,
          Offset: limit * (page - 1),
          Limit: limit,
        },
      }).then(result => {
        if (_.isArray(result?.Items)) {
          users = _.map(result.Items, function (serverData) {
            return new UserModel(tenantId, serverData)
          })
          const totalCount = typesUtils.pInt(result.Count)
          resolve({ users, totalCount, search, page, limit })
        } else {
          resolve({ users, totalCount: 0, search, page, limit })
        }
      }, response => {
        notification.showError(errors.getTextFromResponse(response))
        resolve({ users, totalCount: 0, search, page, limit })
      })
    })
  },
  getUser (tenantId, userId) {
    return new Promise((resolve, reject) => {
      let user = users.find(user => {
        return user.tenantId === tenantId && user.id === userId
      })
      if (user && user.completeData) {
        resolve({ user, userId })
      } else {
        webApi.sendRequest({
          moduleName: 'Core',
          methodName: 'GetUser',
          parameters: {
            Type: 'User',
            TenantId: tenantId,
            Id: userId,
          },
        }).then(result => {
          if (_.isObject(result)) {
            if (user) {
              user.setCompleteData(result)
            } else {
              user = new UserModel(tenantId, result, result)
            }
            resolve({ user, userId })
          } else {
            resolve({ user: null, userId })
          }
        }, response => {
          notification.showError(errors.getTextFromResponse(response))
          resolve({ user: null, userId })
        })
      }
    })
  },
}