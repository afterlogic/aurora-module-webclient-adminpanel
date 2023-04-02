import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'

import messages from 'src/i18n'

const loadedLanguages = ['en']

export const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  lazy: true,
  messages,
})

function setI18nLanguage(lang) {
  i18n.locale = lang
  document.querySelector('html').setAttribute('lang', lang)
  return lang
}

export function loadLanguageAsync(lang) {
  if (i18n.locale === lang) {
    return Promise.resolve(setI18nLanguage(lang))
  }

  if (loadedLanguages.includes(lang)) {
    return Promise.resolve(setI18nLanguage(lang))
  }

  return import('../i18n/' + lang + '/index.json').then((messages) => {
    i18n.global.setLocaleMessage(lang, messages.default)
    loadedLanguages.push(lang)
    return setI18nLanguage(lang)
  })
}

export default boot(({ app }) => {
  app.use(i18n)
})

// export default i18n;

// import Vue from 'vue'
// import VueI18n from 'vue-i18n'
// import messages from 'src/i18n'

// Vue.use(VueI18n)

// export const i18n = new VueI18n({
//   locale: 'en-US',
//   fallbackLocale: 'en-US',
//   messages,
//   preserveDirectiveContent: true
// })

// const loadedLanguages = ['en-US']

// function setI18nLanguage (lang) {
//   i18n.locale = lang
//   document.querySelector('html').setAttribute('lang', lang)
//   return lang
// }

// export function loadLanguageAsync(lang) {
//   if (i18n.locale === lang) {
//     return Promise.resolve(setI18nLanguage(lang))
//   }

//   if (loadedLanguages.includes(lang)) {
//     return Promise.resolve(setI18nLanguage(lang))
//   }

//   return import('../i18n/' + lang + '/index.json').then(
//     messages => {
//       i18n.setLocaleMessage(lang, messages.default)
//       loadedLanguages.push(lang)
//       return setI18nLanguage(lang)
//     }
//   )
// }

// export default ({ app }) => {
//   // Set i18n instance on app
//   app.i18n = i18n
// }
