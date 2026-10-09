/**
 * 主题清单（供 ThemeSwitch 渲染切换列表）
 *
 * 主题切换本身不需要插件：库的 RootContainer 会跟随 `bus.setState('theme', name)`
 * 自动把 `theme-{name}` 落到 body 上，容器也会渲染 `site-container--theme-{name}`。
 * 这里只提供列表数据与色块示意。
 *
 * 库内置主题的变量定义见库的 src/styles/themes.scss；
 * 消费方自定义的主题见同目录的 theme-brand.scss（演示 Sass 定制路径）。
 */

export const DEFAULT_THEME = 'default'

export interface ThemeOption {
  /** 主题名，对应 theme-generator 的第一个参数 */
  name: string
  label: string
  /** 仅用于列表里的色块示意；渐变主题取它的纯净色 */
  color: string
  /** 由消费方自定义、库本身不含的主题 */
  custom?: boolean
}

/** 库内置主题，与 themes.scss 的 theme-generator 调用一一对应 */
export const THEMES: ThemeOption[] = [
  { name: 'default', label: '默认蓝', color: '#0070b2' },
  { name: 'primary', label: '藏青', color: '#3f6ad8' },
  { name: 'gray', label: '灰', color: '#6c757d' },
  { name: 'red', label: '胭脂红', color: '#c0415f' },
  { name: 'eggplant', label: '茄紫', color: '#794c8a' },
  { name: 'grow-early', label: '渐变 · 薄荷', color: '#3cba92' },
  { name: 'plum-plate', label: '渐变 · 紫罗兰', color: '#667eea' },
  { name: 'midnight-bloom', label: '渐变 · 午夜', color: '#2b5876' },
  { name: 'night-sky', label: '渐变 · 夜空', color: '#1e3c72' },
  { name: 'slick-carbon', label: '渐变 · 碳黑', color: '#323232' },
  { name: 'royal', label: '渐变 · 皇家', color: '#141e30' },

  // 自定义主题：颜色与派生色都由消费方在 theme-brand.scss 里给出
  { name: 'brand-orange', label: '品牌橙 · 自定义', color: '#ff6b00', custom: true },
]
