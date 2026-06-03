import { createI18n } from 'vue-i18n'

function loadLocaleMessages(): Record<string, any> {
  const locales = import.meta.glob('./locales/*.json5', {
    as: 'raw',
    eager: true,
  })

  const messages: Record<string, any> = {}

  Object.keys(locales).forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      // 使用 JSON5 解析（这里简化处理，实际可能需要 json5 库）
      try {
        const content = locales[key] as string
        // 简单的 JSON5 解析（移除注释和尾随逗号）
        const jsonStr = content
          .replace(/\/\*[\s\S]*?\*\//g, '') // 移除块注释
          .replace(/\/\/.*$/gm, '') // 移除行注释
          .replace(/,\s*([}\]])/g, '$1') // 移除尾随逗号
        messages[locale] = JSON.parse(jsonStr)
      } catch (e) {
        // 如果解析失败，尝试使用 eval
        try {
          messages[locale] = eval('(' + locales[key] + ')')
        } catch (_e) {
          console.error(`Failed to parse locale file: ${key}`)
        }
      }
    }
  })

  return messages
}

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: loadLocaleMessages(),
})

export default i18n
