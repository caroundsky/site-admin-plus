import { defineStore } from 'pinia'
import Cookie from 'js-cookie'
import i18n from './main'

interface State {
  locale: string
}

const validLocale = ['zh-CN', 'en-US']

const getLocale = () => {
  const cookieLocal = (Cookie.get('Culture') || '').replace('lang=', '')
  return cookieLocal || 'zh-CN'
}

export const useI18nStore = defineStore('i18n', {
  state: (): State => ({
    locale: getLocale(),
  }),

  actions: {
    setLocale(locale: string) {
      if (validLocale.includes(locale)) {
        this.locale = locale
        i18n.global.locale.value = locale as any
      }
    },
  },
})

export default useI18nStore
