import { defineStore } from 'pinia'
import Cookie from 'js-cookie'
import i18n, { getInitLocale, validLocale } from './main'

interface State {
  locale: string
}

export const useI18nStore = defineStore('i18n', {
  state: (): State => ({
    locale: getInitLocale(),
  }),

  actions: {
    setLocale(locale: string) {
      if (validLocale.includes(locale)) {
        this.locale = locale
        i18n.global.locale.value = locale as any
        // 持久化到 cookie，供下次启动读取
        Cookie.set('Culture', `lang=${locale}`, { expires: 365 })
      }
    },
  },
})

export default useI18nStore
