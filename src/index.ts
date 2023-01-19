import Vue, { VueConstructor } from 'vue'
import Vuex, { Store } from 'vuex'
import Fragment from 'vue-fragment'
import isFunction from 'lodash/isFunction'
import isPlainObject from 'lodash/isPlainObject'

/** Vuex modules */
import AppModule from '@/store/app'
import MenuModule from '@/store/menu'
import MenuViewsModule from '@/store/menuViews'

/* Styles */
import 'normalize.css'
import 'font-awesome/css/font-awesome.css'
import '@/import-element-ui'
import '@/styles/index.less'

/* Internal components */
import FlexContainer from '@/components/FlexContainer.vue'
import FlexMain from '@/components/FlexMain.vue'
import RootContainer from '@/RootContainer.vue'
import PluginSlot from '@/PluginSlot.vue'

/* 全局菜单右键功能 */
import '@/components/ContextMenu'

/* Tools & types */
import bus, { BusConfig } from '@/bus'
import * as tools from '@/tools'
import { ensureArray } from '@/utils/tools'
import { warn } from '@/utils/debug'
import { Plugin, PluginCtx, PluginHasStore } from '~/types'

Vue.component('FlexContainer', FlexContainer)
Vue.component('FlexMain', FlexMain)
Vue.component('PluginSlot', PluginSlot)
Vue.use(Fragment.Plugin)

export interface AppInstance {
  component: VueConstructor<Vue>
  $store: Store<any>
  $on: Vue['$on']
  $emit: Vue['$emit']
  $watch: Vue['$watch']
  $tools: typeof tools
}

export interface RawInputOptions {
  config: BusConfig
  store: Store<any>
  plugins: Plugin[]
}

let instance: AppInstance

function _isPluginHasStore(plugin: Plugin): plugin is PluginHasStore {
  const store = (plugin as PluginHasStore).storeModule
  return store && isPlainObject(store)
}

export function create(rawInputOptions: RawInputOptions) {
  if (instance) {
    return instance
  }

  /** Config init */
  const config = rawInputOptions.config
  if (isPlainObject(config)) {
    // TODO: config validate
    bus.config = config
  }

  /** Store init */
  let rootStore = rawInputOptions.store
  if (!rootStore) {
    rootStore = new Vuex.Store({
      strict: process.env.NODE_ENV !== 'production',
    })
  }
  rootStore.registerModule('app', AppModule)
  rootStore.registerModule('menu', MenuModule)
  rootStore.registerModule('menuViews', MenuViewsModule)
  bus.setStore(rootStore)

  /** Apply plugins */
  const $on = bus.$on.bind(bus)
  const $emit = bus.$emit.bind(bus)
  const $watch = bus.$watch.bind(bus)
  const pluginCtx: PluginCtx = {
    $bus: bus,
    $tools: tools,
    $store: rootStore,
    $on,
    $emit,
  }
  const normalizePlugins = (plugins: Plugin[]) => {
    const validPlugin: Plugin[] = []
    plugins.forEach((plugin) => {
      if (isFunction(plugin)) {
        plugin = plugin(pluginCtx)
      }
      if (_isPluginHasStore(plugin) && !plugin.name) {
        warn("包含 'storeModule' 的插件需提供 'name' 属性用于注册命名空间。")
      } else if (isPlainObject(plugin)) {
        validPlugin.push(plugin)
      }
    })
    return validPlugin
  }
  const rawPlugins = ensureArray(rawInputOptions.plugins) as Plugin[]
  const normalizedPlugins = normalizePlugins(rawPlugins)
  normalizedPlugins.forEach((plugin) => {
    // Register store
    if (_isPluginHasStore(plugin)) {
      const pluginStoreModule = plugin.storeModule
      pluginStoreModule.namespaced = true
      rootStore.registerModule(plugin.name, pluginStoreModule)
    }

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

  instance = { component: RootContainer, $watch, ...pluginCtx }
  return instance
}
