/* eslint-env node */

import { defineConfig } from '#q-app/wrappers'

export default defineConfig(function (ctx) {
  return {
    supportTS: false,

    boot: ['i18n', 'axios'],

    css: ['app.scss'],

    extras: [
      'roboto-font',
      'material-icons',
    ],

    build: {
      vueRouterMode: 'hash',
      env: {
        API: ctx.dev ? 'http://platform.de/' : '',
      },

      chainWebpack (chain) {
        chain.module
          .rule('i18n')
          .resourceQuery(/blockType=i18n/)
          .type('javascript/auto')
          .use('i18n')
          .loader('@intlify/vue-i18n-loader')
      },
    },

    devServer: {
      server: {
        type: 'http',
      },
      port: 8080,
      open: true,
    },

    framework: {
      config: {},
      plugins: ['Notify', 'Meta'],
    },

    animations: [],

    ssr: {
      pwa: false,
      prodPort: 3000,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      middlewares: [
        ctx.prod ? 'compression' : '',
        'render',
      ],
    },

    pwa: {
      workboxPluginMode: 'GenerateSW',
      workboxOptions: {},
      manifest: {
        name: `Quasar App`,
        short_name: `Quasar App`,
        description: `A Quasar Project`,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    },

    cordova: {
    },

    capacitor: {
      hideSplashscreen: true,
    },

    electron: {
      bundler: 'packager',
      packager: {
      },
      builder: {
        appId: 'aurora',
      },
    },
  }
})
