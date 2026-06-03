import { createApp, type App, type Component } from 'vue'
import { createPinia, type Pinia } from 'pinia'
import isFunction from 'lodash/isFunction'
import isPlainObject from 'lodash/isPlainObject'

/* Styles */
import 'normalize.css'
import { setupElementPlus } from '@/import-element-ui'
import '@/styles/index.less'

/* Internal components */
import FlexContainer from '@/components/FlexContainer.vue'
import FlexMain from '@/components/FlexMain.vue'
import RootContainer from '@/RootContainer.vue'
import PluginSlot from '@/PluginSlot.vue'

/* 全局菜单右键功能 */
import '@/components/ContextMenu'

/* Tools & types */
import bus, { type BusConfig } from '@/bus'
import * as tools from '@/tools'
import { ensureArray } from '@/utils/tools'
import { warn } from '@/utils/debug'
import type { Plugin, PluginCtx, PluginBase, PluginHasStore } from '~/types'
import { useAppStore } from '@/stores/app'
import { useMenuStore } from '@/stores/menu'
import { useMenuViewsStore } from '@/stores/menuViews'

export interface AppInstance {
  app: App
  component: Component
  pinia: Pinia
  $tools: typeof tools
  bus: typeof bus
  store: {
    appStore: typeof import('@/stores/app').useAppStore
    menuStore: typeof import('@/stores/menu').useMenuStore
    menuViewsStore: typeof import('@/stores/menuViews').useMenuViewsStore
  }
}

export interface RawInputOptions {
  config: BusConfig
  plugins: Plugin[]
}

let instance: AppInstance

function _isPluginHasStore(plugin: PluginBase): plugin is PluginHasStore {
  const store = (plugin as PluginHasStore).storeModule
  return store && isPlainObject(store)
}

function _isPluginBase(plugin: Plugin): plugin is PluginBase {
  return isPlainObject(plugin)
}

export function create(rawInputOptions: RawInputOptions): AppInstance {
  if (instance) {
    return instance
  }

  /** Config init */
  const config = rawInputOptions.config
  if (isPlainObject(config)) {
    bus.setConfig(config)
  }

  /** Create Vue app */
  const app = createApp(RootContainer)

  /** Setup Element Plus */
  setupElementPlus(app)

  /** Pinia init */
  const pinia = createPinia()
  app.use(pinia)

  /** Register global components */
  app.component('FlexContainer', FlexContainer)
  app.component('FlexMain', FlexMain)
  app.component('PluginSlot', PluginSlot)

  /** Apply plugins */
  const pluginCtx: PluginCtx = {
    $bus: bus,
    $tools: tools,
    $store: pinia as any,
    $on: bus.on.bind(bus),
    $emit: bus.emit.bind(bus),
  }

  const normalizePlugins = (plugins: Plugin[]): PluginBase[] => {
    const validPlugin: PluginBase[] = []
    plugins.forEach((plugin) => {
      if (isFunction(plugin)) {
        const result = (plugin as (ctx: PluginCtx) => PluginBase | void)(
          pluginCtx,
        )
        if (result) {
          plugin = result
        } else {
          return
        }
      }
      if (_isPluginBase(plugin)) {
        if (_isPluginHasStore(plugin) && !plugin.name) {
          warn("包含 'storeModule' 的插件需提供 'name' 属性用于注册命名空间。")
        } else {
          validPlugin.push(plugin)
        }
      }
    })
    return validPlugin
  }

  const rawPlugins = ensureArray(rawInputOptions.plugins) as Plugin[]
  const normalizedPlugins = normalizePlugins(rawPlugins)

  normalizedPlugins.forEach((plugin) => {
    // Bind slots
    const slots = plugin.slots
    if (slots && isPlainObject(slots)) {
      Object.entries(slots).forEach(([key, value]) => bus.addSlot(key, value))
    }

    // Bind effects function
    const effects = plugin.effects
    if (isFunction(effects)) {
      effects(pluginCtx)
    }
  })

  instance = {
    app,
    component: RootContainer,
    pinia,
    $tools: tools,
    bus,
    store: {
      appStore: useAppStore,
      menuStore: useMenuStore,
      menuViewsStore: useMenuViewsStore,
    },
  }

  return instance
}

/**
 * 创建库实例（不自动创建 app）
 * 用于外部应用集成，允许使用自定义根组件
 */
export interface LibraryInstance {
  pinia: Pinia
  bus: typeof bus
  $tools: typeof tools
  component: Component
  store: {
    appStore: typeof import('@/stores/app').useAppStore
    menuStore: typeof import('@/stores/menu').useMenuStore
    menuViewsStore: typeof import('@/stores/menuViews').useMenuViewsStore
  }
  /**
   * 安装到外部 Vue 应用
   * @param app 外部 Vue 应用实例
   */
  install: (app: App) => void
}

export function createLibrary(
  rawInputOptions: Omit<RawInputOptions, 'config'> & { config: BusConfig },
): LibraryInstance {
  /** Config init */
  const config = rawInputOptions.config
  if (isPlainObject(config)) {
    bus.setConfig(config)
  }

  /** Create Pinia */
  const pinia = createPinia()

  /** Apply plugins */
  const pluginCtx: PluginCtx = {
    $bus: bus,
    $tools: tools,
    $store: pinia as any,
    $on: bus.on.bind(bus),
    $emit: bus.emit.bind(bus),
  }

  const normalizePlugins = (plugins: Plugin[]): PluginBase[] => {
    const validPlugin: PluginBase[] = []
    plugins.forEach((plugin) => {
      if (isFunction(plugin)) {
        const result = (plugin as (ctx: PluginCtx) => PluginBase | void)(
          pluginCtx,
        )
        if (result) {
          plugin = result
        } else {
          return
        }
      }
      if (_isPluginBase(plugin)) {
        if (_isPluginHasStore(plugin) && !plugin.name) {
          warn("包含 'storeModule' 的插件需提供 'name' 属性用于注册命名空间。")
        } else {
          validPlugin.push(plugin)
        }
      }
    })
    return validPlugin
  }

  const rawPlugins = ensureArray(rawInputOptions.plugins) as Plugin[]
  const normalizedPlugins = normalizePlugins(rawPlugins)

  normalizedPlugins.forEach((plugin) => {
    const slots = plugin.slots
    if (slots && isPlainObject(slots)) {
      Object.entries(slots).forEach(([key, value]) => bus.addSlot(key, value))
    }

    const effects = plugin.effects
    if (isFunction(effects)) {
      effects(pluginCtx)
    }
  })

  const install = (app: App) => {
    app.use(pinia)
    setupElementPlus(app)
    app.component('FlexContainer', FlexContainer)
    app.component('FlexMain', FlexMain)
    app.component('PluginSlot', PluginSlot)
    app.component('SiteContainer', RootContainer)
  }

  return {
    pinia,
    bus,
    $tools: tools,
    component: RootContainer,
    store: {
      appStore: useAppStore,
      menuStore: useMenuStore,
      menuViewsStore: useMenuViewsStore,
    },
    install,
  }
}

export { bus, tools, RootContainer as SiteContainer }
export type { BusConfig, Plugin, PluginCtx }
