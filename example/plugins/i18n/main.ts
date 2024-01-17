import Vue from 'vue'
import VueI18n, { LocaleMessages } from 'vue-i18n'

Vue.use(VueI18n)

function loadLocaleMessages(): LocaleMessages {
  const locales = import.meta.glob('./locales/*.json5', {
    as: 'raw',
    eager: true,
  })

  const messages: LocaleMessages = {}

  Object.keys(locales).forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      messages[locale] = eval('(' + locales[key] + ')')
    }
  })

  return messages
}

export default new VueI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: loadLocaleMessages(),
})
