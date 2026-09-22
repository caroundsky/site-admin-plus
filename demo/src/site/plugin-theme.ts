/**
 * 示例插件：主题
 *
 * 库把主题色变量定义在 `body.theme-{name}` 选择器下（见库的 src/styles/themes.scss），
 * 但**库自身不会去加这个 class** —— 按设计由主题插件负责，见库的
 * src/layouts/index.vue 注释「主题由主题插件通过 bus.setState('theme', ...) 同步」。
 *
 * 这里做两件事：
 *  1. 把当前主题名同步到 bus（容器据此渲染 `site-container--theme-{name}`）
 *  2. 给 <body> 加 `theme-{name}`，让 `--theme-color` 真正有值
 */
import { watch } from 'vue'
import type { Plugin, PluginCtx } from '@caroundsky/lemon-admin'

export const DEFAULT_THEME = 'default'

/** 库内置的主题名，对应 themes.scss 里的 theme-generator 调用 */
export const THEMES = [
  'default',
  'primary',
  'gray',
  'red',
  'eggplant',
  'grow-early',
  'plum-plate',
  'midnight-bloom',
  'night-sky',
  'slick-carbon',
  'royal',
] as const

const applyBodyTheme = (name: string) => {
  const body = document.body
  // 倒序遍历：边删边遍历时不会漏项（demo 的 tsconfig 未开 DOM.Iterable，故不用迭代器）
  for (let i = body.classList.length - 1; i >= 0; i--) {
    const cls = body.classList.item(i)
    if (cls?.startsWith('theme-')) body.classList.remove(cls)
  }
  body.classList.add(`theme-${name}`)
}

export default function themePlugin(): Plugin {
  return {
    name: 'theme',
    effects({ $bus }: PluginCtx) {
      $bus.setState('theme', DEFAULT_THEME)
      applyBodyTheme(DEFAULT_THEME)

      watch(
        () => $bus.state.theme as string,
        (name) => applyBodyTheme(name || DEFAULT_THEME),
      )
    },
  }
}
