import { defineStore } from 'pinia'
import keyBy from 'lodash/keyBy'
import intersectionBy from 'lodash/intersectionBy'

import flattenTree from '@/utils/flattenTree'
import * as debug from '@/utils/debug'
import { readStorage, writeStorage } from '@/utils/storage'
import bus from '@/bus'

import type { NavMenuItem } from '@/types/interfaces'

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
      if (!Array.isArray(payload)) {
        debug.error('菜单数据不符合格式！')
        return
      }

      const navMenuModeCache =
        readStorage<Record<string, boolean>>('navMenuMode')

      // 按**本次菜单**重建开关表：只沿用仍存在的 id 上用户做过的选择，新 id 取其 show 值。
      //
      // 不能整体套用旧缓存 —— 开关表以菜单 id 为键，换一套菜单后新 id 不在表里，
      // 取值 undefined，会被 NavMenu 的
      // `if (level === 1 && !navMenuMode[menu.id]) return null` 全部过滤掉，
      // 表现为「有缓存时菜单整片空白」。
      const navMenuMode: Record<string, boolean> = {}
      payload.forEach((item) => {
        if (item.id === undefined) return
        navMenuMode[item.id] =
          navMenuModeCache && item.id in navMenuModeCache
            ? navMenuModeCache[item.id]
            : !!item.show
      })

      this.navMenu = payload
      this.navMenuMode = navMenuMode
      bus.emit('setMenusCompelet')
    },

    toggleMenuShow(payload: string | boolean) {
      if (typeof payload === 'string') {
        this.navMenuMode[payload] = !this.navMenuMode[payload]
      } else if (typeof payload === 'boolean') {
        for (const key in this.navMenuMode) {
          this.navMenuMode[key] = payload
        }
      }

      writeStorage('navMenuMode', this.navMenuMode)
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
      const cached = readStorage<NavMenuItem[]>('SearchLocalCache')
      if (!cached) return

      // 与当前菜单求交集，避免历史里残留已下线的菜单
      this.menuSearchHistory = intersectionBy(this.flatNavMenu, cached, 'id')
    },

    saveMenuSearchHistory(payload: NavMenuItem) {
      if (this.menuSearchHistory.some((item) => item.id === payload.id)) return
      this.menuSearchHistory.unshift(payload)
      writeStorage('SearchLocalCache', this.menuSearchHistory)
    },
  },
})
