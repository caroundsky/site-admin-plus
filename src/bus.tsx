import Vue from 'vue'
import { Store } from 'vuex'
import get from 'lodash/get'
import { ensureArray } from '@/utils/tools'

type ContextMenuFn = (view: any) => Array<{
  label: string,
  icon?: string,
  onClick: Function
}>

export interface BusConfig {
  [k: string]: any
  navMenu: Partial<{
    /**
     * 是否默认垂直菜单
     * @default false
     */
    defaultAside: boolean

    /**
     * 是否可切换水平/垂直菜单，若禁用会强制使用 defaultAside 的设置
     * @default false
     */
    disableLayoutSwitch: boolean

    search: boolean
    uniqueOpened: boolean
    popoverLevel: number
    popoverHeightRatio: number
    popoverColumnMaxWidth: number
    maxDepartNum: number
    popoverTrigger: 'hover' | 'click'
  }>
  HOME_PAGE: string | ''
  FIXED_DRAG: Array<string> | []
}

const pluginSlots = new Map<string, Vue[]>()

const bus = new Vue({
  data() {
    return {
      store: null as any,
      config: {
        HOME_PAGE: 'homePage',
        FIXED_DRAG: ['homePage']
      } as Partial<BusConfig>,
      state: {},
      setContextMenu: {
        menuItem: null,
        menuViewBar: null
      } as {
        menuItem: null | ContextMenuFn,
        menuViewBar: null | ContextMenuFn
      }
    }
  },
  methods: {
    addSlot(name: string, slotComponent: Vue) {
      const slots = pluginSlots.get(name) || []
      slots.push(slotComponent)
      pluginSlots.set(name, slots)
    },
    getSlots(name: string) {
      return ensureArray(pluginSlots.get(name))
    },

    setStore(store: Store<any>) {
      this.store = store
    },
    getStore(): Store<any> {
      return this.store
    },

    getState(key: string) {
      return get(this.state, key)
    },
    setState(key: string, value: any) {
      return this.$set(this.state, key, value)
    },
  },
})

export default bus
