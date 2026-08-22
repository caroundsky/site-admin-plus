import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import keyBy from 'lodash/keyBy'
import intersectionBy from 'lodash/intersectionBy'
import localforage from 'localforage'

import flattenTree from '@/utils/flattenTree'
import * as debug from '@/utils/debug'
import bus from '@/bus'

import type { NavMenuItem } from '~/types/interfaces'

interface MenuState {
  navMenu: NavMenuItem[]
  navMenuMode: Record<string, boolean>
  searchKeyword: string
  menuSearchPY: string[]
  menuSearchPYids: string[]
  menuSearchHistory: NavMenuItem[]
}

export const useMenuStore = defineStore('menu', {
  state: (): MenuState => ({
    navMenu: [],
    navMenuMode: {},
    searchKeyword: '',
    menuSearchPY: [],
    menuSearchPYids: [],
    menuSearchHistory: [],
  }),

  getters: {
    flatNavMenu: (state): NavMenuItem[] => {
      return flattenTree(state.navMenu)
    },

    navMenuMap(): Record<string, NavMenuItem> {
      return keyBy(this.flatNavMenu, 'id')
    },
  },

  actions: {
    async setNavMenu(payload: NavMenuItem[]) {
      if (Array.isArray(payload)) {
        let newObj: Record<string, boolean> = {}
        const navMenuModeCache = await localforage.getItem<Record<
          string,
          boolean
        > | null>('SiteContainer/navMenuMode')

        if (navMenuModeCache) {
          newObj = navMenuModeCache
        }

        if (newObj && Object.keys(newObj).length === 0) {
          payload.forEach((item) => {
            if (!item.show) return
            const { id, show } = item
            newObj[id] = show
          })
        }

        this.navMenu = payload
        this.navMenuMode = newObj
        bus.emit('setMenusCompelet')
      } else {
        debug.error('菜单数据不符合格式！')
      }
    },

    toggleMenuShow(payload: string | boolean) {
      if (typeof payload === 'string') {
        this.navMenuMode[payload] = !this.navMenuMode[payload]
      } else if (typeof payload === 'boolean') {
        for (const key in this.navMenuMode) {
          this.navMenuMode[key] = payload
        }
      }

      // Pinia state 是响应式 Proxy，IndexedDB 无法克隆，需先转为原始对象
      localforage.setItem('SiteContainer/navMenuMode', toRaw(this.navMenuMode))
    },

    setSearchKeyword(payload: string) {
      this.searchKeyword = payload
    },

    setMenuSearchPY(payload: string[]) {
      if (Array.isArray(payload)) {
        this.menuSearchPY = payload
      }
    },

    setMenuSearchPYids(payload: string[]) {
      if (Array.isArray(payload)) {
        this.menuSearchPYids = payload
      }
    },

    async initSearchHistory() {
      let result = await localforage.getItem<NavMenuItem[] | null>(
        'SiteContainer/SearchLocalCache',
      )
      if (!result) return

      result = intersectionBy(this.flatNavMenu, result, 'id')
      this.menuSearchHistory = result || []
    },

    saveMenuSearchHistory(payload: NavMenuItem) {
      if (this.menuSearchHistory.some((item) => item.id === payload.id)) return
      this.menuSearchHistory.unshift(payload)
      localforage.setItem(
        'SiteContainer/SearchLocalCache',
        toRaw(this.menuSearchHistory),
      )
    },
  },
})
