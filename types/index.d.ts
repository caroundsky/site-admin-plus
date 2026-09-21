/**
 * 库的类型入口（@types 风格，人工维护），需与 src/main.ts 的运行时导出保持一致。
 *
 * 注意：本文件会被消费方的 TS 直接解析，所有引用必须用相对路径或包名，
 * 不可使用 '@/xxx' 这类本仓库别名——消费方的 @ 指向他们自己的 src。
 */
import type { App, Component } from 'vue'
import type { Pinia } from 'pinia'
import type { BusConfig } from '../src/bus'
import bus from '../src/bus'
import * as tools from '../src/tools'
import { useAppStore } from '../src/stores/app'
import { useMenuStore } from '../src/stores/menu'
import { useMenuViewsStore } from '../src/stores/menuViews'

/* ---------- 运行时导出（与 src/main.ts 一致） ---------- */

export { bus, tools }
export { useAppStore, useMenuStore, useMenuViewsStore }
export type { BusConfig }

/** 站点容器根组件，等价于模板里的 `<SiteContainer />` */
export const SiteContainer: Component

/**
 * 按需注册 Element Plus 图标组件。
 *
 * 库只预注册了少量常用图标，插件模板里用到其它图标时需自行注册：
 * ```ts
 * import { Search } from '@element-plus/icons-vue'
 * import { registerIcons } from '@caroundsky/lemon-admin'
 *
 * registerIcons(app, { Search })
 * ```
 */
export function registerIcons(
  app: App,
  icons: Record<string, Component>,
): App

/** Element Plus 样式的私有命名空间前缀（当前为 'lemon'） */
export const ELEMENT_NAMESPACE: string

/* ---------- 通用类型 ---------- */

export type {
  SimpleMap,
  NavMenuItem,
  MenuView,
  FavNavMenuItem,
  Theme,
  ContextButton,
} from './interfaces'

/* ---------- 库实例 ---------- */

/** 库三个 store 的 composable 集合 */
export interface StoreSet {
  appStore: typeof useAppStore
  menuStore: typeof useMenuStore
  menuViewsStore: typeof useMenuViewsStore
}

/** `create()` 的返回值：已创建好 Vue 应用 */
export interface AppInstance {
  app: App
  component: Component
  pinia: Pinia
  $tools: typeof tools
  bus: typeof bus
  store: StoreSet
}

export interface RawInputOptions {
  config: BusConfig
  plugins: Plugin[]
}

/** `createLibrary()` 的返回值：不自动创建应用，由使用方接管 */
export interface LibraryInstance {
  pinia: Pinia
  bus: typeof bus
  $tools: typeof tools
  component: Component
  store: StoreSet
  install: (app: App) => void
}

export function create(rawInputOptions: RawInputOptions): AppInstance

export function createLibrary(
  rawInputOptions: Omit<RawInputOptions, 'config'> & { config: BusConfig },
): LibraryInstance

/* ---------- 插件 ---------- */

export interface PluginCtx {
  $tools: typeof tools
  $bus: typeof bus
  $store: Pinia
  $on: typeof bus.on
  $emit: typeof bus.emit
}

export interface PluginBase {
  name?: string
  slots?: Record<string, any>
  effects?: (ctx: PluginCtx) => void
}

export type Plugin = PluginBase | ((ctx: PluginCtx) => Plugin | void)

export type PluginFunction = (ctx: PluginCtx) => Plugin | void

export type CreateOptions = {
  config: BusConfig
  plugins: Plugin[]
}
