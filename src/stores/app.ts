import { defineStore } from 'pinia'
import bus from '@/bus'

interface AppState {
  initStatus: string
  isInited: boolean
  isAsideMenu: boolean
  isAsideMenuOpen: boolean
  isUserSet: boolean
  isMenuMaskOpen: boolean
  menuKey: number
  menuTabTouch: boolean
  menuTabMoveInArea: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    initStatus: '',
    isInited: false,
    isAsideMenu: true,
    isAsideMenuOpen: true,
    isUserSet: false,
    isMenuMaskOpen: false,
    menuKey: 0,
    menuTabTouch: false,
    menuTabMoveInArea: false,
  }),

  actions: {
    setInitStatus(status: string) {
      this.initStatus = status
    },

    initDone() {
      this.initStatus = ''
      this.isInited = true
    },

    init() {
      let isAsideMenu
      const config = bus.config
      if (config.navMenu?.disableLayoutSwitch) {
        isAsideMenu = config.navMenu?.defaultAside
      } else {
        const local = localStorage.getItem('SiteContainer/defaulAsideMenu')
        isAsideMenu = local === null ? config.navMenu?.defaultAside : local
      }

      this.isAsideMenu = !!isAsideMenu
    },

    toggleNavMenuLayout() {
      this.isAsideMenu = !this.isAsideMenu
      localStorage.setItem(
        'SiteContainer/defaulAsideMenu',
        this.isAsideMenu ? '1' : '',
      )
    },

    toggleSideMenu() {
      this.isAsideMenuOpen = !this.isAsideMenuOpen
    },

    userSet() {
      this.isUserSet = !this.isUserSet
    },

    toggleMaskMenu() {
      this.isMenuMaskOpen = !this.isMenuMaskOpen
    },

    updateMenuKey() {
      this.menuKey++
    },

    setMenuTabTouch(val: boolean) {
      this.menuTabTouch = val
    },

    setMenuTabMoveInArea(val: boolean) {
      this.menuTabMoveInArea = val
    },
  },
})
