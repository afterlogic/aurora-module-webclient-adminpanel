<template>
  <div class="row q-mb-md">
    <div class="col-1 q-my-sm" v-t="'COREWEBCLIENT.LABEL_EMAIL'"></div>
    <div class="col-5">
      <q-input outlined dense bg-color="white" v-model="publicId" ref="publicId" :disable="!createMode"
               @keyup.enter="save" />
    </div>
  </div>
</template>

<script>
import _ from 'lodash'

import notification from 'src/utils/notification'

export default {
  name: 'EditUserPublicId',

  props: {
    user: Object,
    createMode: Boolean,
  },

  data () {
    return {
      publicId: '',
    }
  },

  watch: {
    user () {
      this.publicId = this.user?.publicId
    },
  },

  mounted () {
    this.publicId = this.user?.publicId
  },

  methods: {
    getSaveParameters () {
      return {
        PublicId: this.createMode ? this.publicId : this.user?.publicId
      }
    },

    hasChanges () {
      return this.publicId !== this.user?.publicId
    },

    isDataValid () {
      const publicId = _.trim(this.publicId)
      if (publicId === '') {
        notification.showError(this.$t('ADMINPANELWEBCLIENT.ERROR_USER_NAME_EMPTY'))
        this.$refs.publicId.$el.focus()
        return false
      }
      return true
    },

    save () {
      this.$emit('save')
    },
  },
}
</script>

<style scoped>

</style>
