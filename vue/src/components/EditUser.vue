<template>
  <q-scroll-area class="full-height full-width relative-position">
    <div class="q-pa-lg ">
      <div class="row q-mb-md">
        <div class="col text-h5" v-if="!createMode" v-t="'COREWEBCLIENT.HEADING_COMMON_SETTINGS'"></div>
        <div class="col text-h5" v-if="createMode" v-t="'ADMINPANELWEBCLIENT.HEADING_CREATE_USER'"></div>
      </div>
      <q-card flat bordered class="card-edit-settings">
        <q-card-section>
          <component v-bind:is="mainDataComponent" ref="mainDataComponent" :currentTenantId="currentTenantId"
                     :user="user" :createMode="createMode" @save="save" />
          <div class="row q-mb-md" v-if="allowMakeTenant">
            <div class="col-1"></div>
            <div class="col-5">
              <q-checkbox dense v-model="isTenantAdmin" :label="$t('ADMINPANELWEBCLIENT.LABEL_USER_IS_TENANT_ADMIN')" />
            </div>
          </div>
          <div class="row" v-if="!createMode">
            <div class="col-1"></div>
            <div class="col-5">
              <q-checkbox dense v-model="writeSeparateLog"
                          :label="$t('ADMINPANELWEBCLIENT.LABEL_LOGGING_SEPARATE_LOG_FOR_USER')" />
            </div>
          </div>
          <component v-for="component in otherDataComponents" :key="component.name" v-bind:is="component"
                     ref="otherDataComponents" :currentTenantId="currentTenantId" :user="user" :createMode="createMode"
                     @save="save" />
        </q-card-section>
      </q-card>
      <div class="q-pt-md text-right">
        <q-btn unelevated no-caps dense class="q-px-sm" :ripple="false" color="negative" @click="deleteUser"
               :label="$t('ADMINPANELWEBCLIENT.ACTION_DELETE_USER')" v-if="!createMode">
        </q-btn>
        <q-btn unelevated no-caps dense class="q-px-sm q-ml-sm" :ripple="false" color="primary" @click="save"
               :label="saveButtonText">
        </q-btn>
        <q-btn unelevated no-caps dense class="q-px-sm q-ml-sm" :ripple="false" color="secondary" @click="cancel"
               :label="$t('COREWEBCLIENT.ACTION_CANCEL')" v-if="createMode" >
        </q-btn>
      </div>
    </div>
    <UnsavedChangesDialog ref="unsavedChangesDialog" />
    <q-inner-loading style="justify-content: flex-start;" :showing="loading || deleting || saving">
      <q-linear-progress query />
    </q-inner-loading>
  </q-scroll-area>
</template>

<script>
import _ from 'lodash'

import errors from 'src/utils/errors'
import notification from 'src/utils/notification'
import typesUtils from 'src/utils/types'
import webApi from 'src/utils/web-api'

import cache from 'src/cache'
import modulesManager from 'src/modules-manager'
import settings from 'src/settings'

import UserModel from 'src/classes/user'

import UnsavedChangesDialog from 'src/components/UnsavedChangesDialog'

import enums from 'src/enums'
const UserRoles = enums.getUserRoles()

export default {
  name: 'EditUser',

  components: {
    UnsavedChangesDialog,
  },

  props: {
    deletingIds: Array,
  },

  data() {
    return {
      mainDataComponent: null,
      otherDataComponents: [],

      allowMakeTenant: settings.getEnableMultiTenant(),

      user: null,
      publicId: '',
      isTenantAdmin: false,
      writeSeparateLog: false,

      loading: false,
      saving: false,
    }
  },

  computed: {
    currentTenantId () {
      return this.$store.getters['tenants/getCurrentTenantId']
    },

    createMode () {
      return this.user?.id === 0
    },

    saveButtonText () {
      if (this.createMode) {
        if (this.saving) {
          return this.$t('COREWEBCLIENT.ACTION_CREATE_IN_PROGRESS')
        } else {
          return this.$t('COREWEBCLIENT.ACTION_CREATE')
        }
      } else {
        if (this.saving) {
          return this.$t('COREWEBCLIENT.ACTION_SAVE_IN_PROGRESS')
        } else {
          return this.$t('COREWEBCLIENT.ACTION_SAVE')
        }
      }
    },

    deleting () {
      return this.deletingIds.indexOf(this.user?.id) !== -1
    },
  },

  watch: {
    $route(to, from) {
      this.parseRoute()
      this.getUserMainDataComponent()
    },
  },

  beforeRouteLeave (to, from, next) {
    if (this.hasChanges() && _.isFunction(this?.$refs?.unsavedChangesDialog?.openConfirmDiscardChangesDialog)) {
      this.$refs.unsavedChangesDialog.openConfirmDiscardChangesDialog(next)
    } else {
      next()
    }
  },

  beforeRouteUpdate (to, from, next) {
    if (this.hasChanges() && _.isFunction(this?.$refs?.unsavedChangesDialog?.openConfirmDiscardChangesDialog)) {
      this.$refs.unsavedChangesDialog.openConfirmDiscardChangesDialog(next)
    } else {
      next()
    }
  },

  mounted () {
    this.getUserMainDataComponent()
    this.getUserOtherDataComponents()
    this.loading = false
    this.saving = false
    this.parseRoute()
  },

  methods: {
    async getUserMainDataComponent () {
      this.mainDataComponent = await modulesManager.getUserMainDataComponent()
    },
    async getUserOtherDataComponents () {
      this.otherDataComponents = await modulesManager.getUserOtherDataComponents()
    },
    parseRoute () {
      if (this.$route.path === '/users/create') {
        const user = new UserModel(this.currentTenantId, {})
        this.fillUp(user)
      } else {
        const userId = typesUtils.pPositiveInt(this.$route?.params?.id)
        if (this.user?.id !== userId) {
          this.user = {
            id: userId,
          }
          this.populate()
        }
      }
    },

    clear () {
      this.publicId = ''
      this.isTenantAdmin = false
      this.writeSeparateLog = false
    },

    fillUp (user) {
      this.user = user
      this.publicId = user.publicId
      this.isTenantAdmin = user.role === UserRoles.TenantAdmin
      this.writeSeparateLog = user.writeSeparateLog
    },

    populate () {
      this.clear()
      this.loading = true
      cache.getUser(this.currentTenantId, this.user.id).then(({ user, userId }) => {
        if (userId === this.user.id) {
          this.loading = false
          if (user) {
            this.fillUp(user)
          } else {
            this.$emit('no-user-found')
          }
        }
      })
    },

    hasChanges () {
      const hasMainDataChanges = _.isFunction(this.$refs?.mainDataComponent?.hasChanges)
        ? this.$refs.mainDataComponent.hasChanges()
        : false
      const hasOtherDataChanges = _.isFunction(this.$refs?.otherDataComponents?.some)
        ? this.$refs.otherDataComponents.some(component => {
          return _.isFunction(component.hasChanges) ? component.hasChanges() : false
        })
        : false
      return hasMainDataChanges || hasOtherDataChanges || this.isTenantAdmin !== (this.user?.role === UserRoles.TenantAdmin) ||
        this.writeSeparateLog !== this.user?.writeSeparateLog
    },

    isDataValid () {
      const isMainDataValid = _.isFunction(this.$refs?.mainDataComponent?.isDataValid)
        ? this.$refs.mainDataComponent.isDataValid()
        : true
      const isOtherDataValid = _.isFunction(this.$refs?.otherDataComponents?.every)
        ? this.$refs.otherDataComponents.every(component => {
          return _.isFunction(component.isDataValid) ? component.isDataValid() : true
        })
        : true
      return isMainDataValid && isOtherDataValid
    },

    save () {
      if (!this.saving && this.isDataValid()) {
        this.saving = true
        const mainDataParameters = _.isFunction(this.$refs?.mainDataComponent?.getSaveParameters)
          ? this.$refs.mainDataComponent.getSaveParameters()
          : {}
        let parameters = _.extend({
          UserId: this.user.id,
          TenantId: this.user.tenantId,
          Role: this.isTenantAdmin ? UserRoles.TenantAdmin : UserRoles.NormalUser,
          WriteSeparateLog: this.writeSeparateLog,
          Forced: true,
        }, mainDataParameters)

        if (_.isFunction(this.$refs?.otherDataComponents?.forEach)) {
          this.$refs.otherDataComponents.forEach(component => {
            const otherParameters = _.isFunction(component.getSaveParameters)
              ? component.getSaveParameters()
              : {}
            parameters = _.extend(parameters, otherParameters)
          })
        }

        const createMode = this.createMode
        webApi.sendRequest({
          moduleName: 'Core',
          methodName: createMode ? 'CreateUser' : 'UpdateUser',
          parameters,
        }).then(result => {
          this.saving = false
          if (createMode) {
            this.handleCreateResult(result, parameters)
          } else {
            this.handleUpdateResult(result, parameters)
          }
        }, response => {
          this.saving = false
          const errorConst = createMode ? 'ERROR_CREATE_ENTITY_USER' : 'ERROR_UPDATE_ENTITY_USER'
          notification.showError(errors.getTextFromResponse(response, this.$t('ADMINPANELWEBCLIENT.' + errorConst)))
        })
      }
    },

    handleCreateResult (result, parameters) {
      if (_.isSafeInteger(result)) {
        notification.showReport(this.$t('ADMINPANELWEBCLIENT.REPORT_CREATE_ENTITY_USER'))
        this.user.update(parameters.Role, parameters.WriteSeparateLog, parameters.PublicId)
        this.$emit('user-created', result)
      } else {
        notification.showError(this.$t('ADMINPANELWEBCLIENT.ERROR_CREATE_ENTITY_USER'))
      }
    },

    handleUpdateResult (result, parameters) {
      if (result === true) {
        cache.getUser(parameters.TenantId, parameters.UserId).then(({ user }) => {
          user.update(parameters.Role, parameters.WriteSeparateLog)
          this.populate()
        })
        notification.showReport(this.$t('ADMINPANELWEBCLIENT.REPORT_UPDATE_ENTITY_USER'))
      } else {
        notification.showError(this.$t('ADMINPANELWEBCLIENT.ERROR_UPDATE_ENTITY_USER'))
      }
    },

    cancel () {
      this.$emit('cancel-create')
    },

    deleteUser () {
      this.$emit('delete-user', this.user.id)
    },
  },
}
</script>

<style scoped>

</style>
