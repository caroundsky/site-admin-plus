import { createI18n } from 'vue-i18n'
import Cookie from 'js-cookie'

export const validLocale = ['zh-CN', 'en-US']

// 从 cookie 读取初始语言（与 storeModule 保持一致）
export const getInitLocale = () => {
  const cookieLocale = (Cookie.get('Culture') || '').replace('lang=', '')
  return validLocale.includes(cookieLocale) ? cookieLocale : 'zh-CN'
}

// vite 原生支持 json 模块，eager 直接拿到解析后的对象
const locales = import.meta.glob<{ default: Record<string, string> }>(
  './locales/*.json',
  { eager: true },
)

const messages: Record<string, Record<string, string>> = {}
Object.keys(locales).forEach((key) => {
  const matched = key.match(/([A-Za-z0-9-_]+)\./i)
  if (matched && matched.length > 1) {
    messages[matched[1]] = locales[key].default
  }
})

const i18n = createI18n({
  legacy: false,
  // 允许模板中直接使用 $t（不强制 useI18n）
  globalInjection: true,
  locale: getInitLocale(),
  fallbackLocale: 'en-US',
  messages,
})

export default i18n
