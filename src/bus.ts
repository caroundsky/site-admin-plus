import { reactive } from 'vue'
import mitt from 'mitt'
// pinia 4 的 Store 泛型带有内部 _p 标记，直接引用类型会出现方差不匹配；
// bus 只保存一个不透明的 store 引用，使用 unknown 即可
import get from 'lodash/get'
import { ensureArray } from '@/utils/tools'
import { getStorageUserKey, setStorageUserKey } from '@/utils/storage'

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
  store: unknown // 原为 Store（pinia），pinia 4 类型方差不兼容，bus 只做不透明引用
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

const setStore = (store: unknown) => {
  busState.store = store
}

const getStore = (): unknown => {
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

/**
 * 设置当前登录用户标识（用于给本地缓存加命名空间）。
 * 传 `null`/空串表示退出登录，会清掉该用户命名空间下的全部缓存。
 */
const setUserKey = (key: string | null) => setStorageUserKey(key)

// 退出登录时自动清掉当前用户的本地缓存。
// 库自身在 AppActionBar 里 emit('logout')，宿主自行 emit 也能覆盖。
emitter.on('logout', () => setUserKey(null))

const bus = {
  ...emitter,
  addSlot,
  getSlots,
  setStore,
  getStore,
  getState,
  setState,
  setConfig,
  setUserKey,
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
  set store(val: unknown) {
    busState.store = val
  },
  get state() {
    return busState.state
  },
  get setContextMenu() {
    return busState.setContextMenu
  },
  get userKey() {
    return getStorageUserKey()
  },
}

export default bus
export {
  bus,
  setConfig,
  setStore,
  addSlot,
  getSlots,
  getState,
  setState,
  setUserKey,
}
