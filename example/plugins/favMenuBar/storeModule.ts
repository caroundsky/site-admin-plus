import { defineStore } from 'pinia'
import keyBy from 'lodash/keyBy'
import intersection from 'lodash/intersection'
import type { MenuView, FavNavMenuItem } from '~/types/interfaces'

import bus from '@/bus'
import removeBy from '@/utils/removeBy'

interface State {
  favMenu: FavNavMenuItem[]
  defaultOpen: FavNavMenuItem['id'][]
  defaultHome: FavNavMenuItem['id'] | null
}

const THEMES: { name: string }[] = [
  { name: 'default' },
  { name: 'primary' },
  { name: 'gray' },
  { name: 'red' },
]

export const useFavMenuStore = defineStore('favMenu', {
  state: (): State => ({
    favMenu: [],
    defaultOpen: [],
    defaultHome: null,
  }),

  getters: {
    favMenuMap: (state) => keyBy(state.favMenu, 'id'),
  },

  actions: {
    addFav(menu: MenuView) {
      this.favMenu.push({
        id: menu.id,
        text: menu.text,
        href: menu.href,
      })
    },

    delFav(view: MenuView) {
      this.favMenu = removeBy(this.favMenu, (item) => item.id === view.id)
      this.unsetDefaultOpen(view.id)
      this.unsetDefaultHome(view.id)
    },

    setDefaultOpen(menuId: FavNavMenuItem['id']) {
      const oldVal = new Set(this.defaultOpen)
      this.defaultOpen = [...oldVal.add(menuId)]
    },

    unsetDefaultOpen(menuId: FavNavMenuItem['id']) {
      this.defaultOpen = removeBy(this.defaultOpen, (id) => id === menuId)
    },

    setDefaultHome(menuId: FavNavMenuItem['id']) {
      this.defaultHome = menuId
    },

    unsetDefaultHome(menuId: FavNavMenuItem['id']) {
      if (this.defaultHome === menuId) {
        this.defaultHome = null
      }
    },

    initFavMenu() {
      // 如果需要持久化，在此处配置local或者接口
      const cacheFav: FavNavMenuItem[] = []
      const cacheDefaultOpen: FavNavMenuItem['id'][] = []
      const cacheDefaultHome: FavNavMenuItem['id'] | null = null

      this.favMenu = cacheFav || []
      this.defaultOpen = cacheDefaultOpen || []
      this.defaultHome = cacheDefaultHome || bus.config.HOME_PAGE
    },
  },
})

export default useFavMenuStore
