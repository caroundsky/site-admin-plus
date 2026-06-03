import { reactive, readonly } from 'vue'
import mitt from 'mitt'
import type { Store } from 'pinia'
import get from 'lodash/get'
import { ensureArray } from '@/utils/tools'

type ContextMenuFn = (view: any) => Array<{
  label: string
  icon?: string
  onClick: () => void
}>

export interface BusConfig {
  [k: string]: any
  navMenu: Partial<{
    defaultAside: boolean
    disableLayoutSwitch: boolean
    search: boolean
    uniqueOpened: boolean
    popoverLevel: number
    popoverHeightRatio: number
    popoverColumnMaxWidth: number
    maxDepartNum: number
    popoverTrigger: 'hover' | 'click'
  }>
  HOME_PAGE: string
  FIXED_DRAG: string[]
}

interface BusState {
  store: Store<any> | null
  config: Partial<BusConfig>
  state: Record<string, any>
  setContextMenu: {
    menuItem: ContextMenuFn | null
    menuViewBar: ContextMenuFn | null
  }
}

type BusEvents = Record<string, any>

// @ts-expect-error mitt type issue
const emitter = mitt<BusEvents>()
const pluginSlots = new Map<string, any[]>()

const busState = reactive<BusState>({
  store: null,
  config: {
    HOME_PAGE: 'homePage',
    FIXED_DRAG: ['homePage'],
  },
  state: {},
  setContextMenu: {
    menuItem: null,
    menuViewBar: null,
  },
})

const addSlot = (name: string, slotComponent: any) => {
  const slots = pluginSlots.get(name) || []
  slots.push(slotComponent)
  pluginSlots.set(name, slots)
}

const getSlots = (name: string) => {
  return ensureArray(pluginSlots.get(name))
}

const setStore = (store: Store<any>) => {
  busState.store = store
}

const getStore = (): Store<any> | null => {
  return busState.store
}

const getState = (key: string) => {
  return get(busState.state, key)
}

const setState = (key: string, value: any) => {
  busState.state[key] = value
}

const setConfig = (config: Partial<BusConfig>) => {
  busState.config = { ...busState.config, ...config }
}

const bus = {
  ...emitter,
  ...readonly(busState),
  addSlot,
  getSlots,
  setStore,
  getStore,
  getState,
  setState,
  setConfig,
  // 兼容 Vue 2 风格的访问方式
  get config() {
    return busState.config
  },
  set config(val: Partial<BusConfig>) {
    busState.config = val
  },
  get store() {
    return busState.store
  },
  set store(val: Store<any> | null) {
    busState.store = val
  },
}

export default bus
export { bus, setConfig, setStore, addSlot, getSlots, getState, setState }
