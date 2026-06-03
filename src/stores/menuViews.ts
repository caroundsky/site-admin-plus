import { defineStore } from 'pinia'
import keyBy from 'lodash/keyBy'
import sortBy from 'lodash/sortBy'

import * as debug from '@/utils/debug'
import removeBy from '@/utils/removeBy'
import bus from '@/bus'

import { useMenuStore } from './menu'

import type { NavMenuItem, MenuView } from '~/types/interfaces'

interface MenuViewsState {
  views: MenuView[]
  activeId: string | null
  refreshId: string | null
}

export const useMenuViewsStore = defineStore('menuViews', {
  state: (): MenuViewsState => ({
    views: [],
    activeId: null,
    refreshId: null,
  }),

  getters: {
    viewsMap: (state): Record<string, MenuView> => {
      return keyBy(state.views, 'id')
    },

    activeView: (state): MenuView | null => {
      return state.activeId
        ? state.views.find((v) => v.id === state.activeId) || null
        : null
    },
  },

  actions: {
    addView(view: MenuView) {
      const result = this.addViewInBack(view)
      if (result) {
        this.activeViewById(result.id)
      }
    },

    addViewNoActive(view: MenuView) {
      this.addViewInBack(view)
    },

    addViewInBack(view: MenuView): MenuView | void {
      const { id, text, href, closable = true } = view
      if (!href) {
        debug.error(`${JSON.stringify(view)} 未提供 'href' 属性`)
        return
      }

      const viewId = id || text || href

      const menuStore = useMenuStore()
      const navMenuMap = menuStore.navMenuMap
      const getNavMenu = navMenuMap[viewId]

      if (getNavMenu && getNavMenu.isNewWindow) {
        window.open(getNavMenu.href)
        return
      }

      if (this.viewsMap[viewId]) {
        this.activeViewById(viewId)
        return this.viewsMap[viewId]
      } else {
        if (!text) {
          debug.warn(`${JSON.stringify(view)} 未提供 'text' 属性`)
          return
        }
        const newView: MenuView = {
          id: viewId,
          text,
          href,
          closable,
        }
        this.ADD_VIEW(newView)
        return newView
      }
    },

    ADD_VIEW(payload: MenuView) {
      const views = [...this.views]
      views.push(payload)
      const FIXED_DRAG = bus.config.FIXED_DRAG ?? [bus.config.HOME_PAGE]
      this.views = sortBy(views, [
        function (view) {
          return !FIXED_DRAG.includes(view.id)
        },
      ])
    },

    addViewById(menuId: string) {
      const menuStore = useMenuStore()
      const menu: NavMenuItem = menuStore.navMenuMap[menuId]
      if (menu) {
        return this.addView(menu)
      }
    },

    addViewByIdNoActive(menuId: string) {
      const menuStore = useMenuStore()
      const menu: NavMenuItem = menuStore.navMenuMap[menuId]
      if (menu) {
        return this.addViewNoActive(menu)
      }
    },

    addViewInBackById(menuId: string) {
      const menuStore = useMenuStore()
      const menu: NavMenuItem = menuStore.navMenuMap[menuId]
      if (menu) {
        return this.addViewInBack(menu)
      }
    },

    activeView(view: MenuView) {
      this.activeViewById(view.id)
    },

    activeViewById(activeId: string): MenuView | null {
      const activeView = this.viewsMap[activeId] || null
      if (activeView) {
        this.activeId = activeId
        bus.emit('active-menu-view', activeView)
      }
      return activeView
    },

    closeView(view: MenuView) {
      this.closeViewById(view.id)
      bus.emit('close-menu-view', view)
    },

    closeViewById(viewId: string) {
      if (!viewId) {
        debug.warn(`${JSON.stringify(viewId)} 未提供 'id' 属性`)
        return
      }

      this.views = removeBy(
        this.views,
        (view) => view.id === viewId && view.closable,
      )

      if (this.views.length !== 0 && this.activeId === viewId) {
        this.activeViewById(this.views[this.views.length - 1].id)
      }
    },

    closeAllViews() {
      this.views = removeBy(this.views, (view) => view.closable)
      this.activeViewById(bus.config.HOME_PAGE)
    },

    closeOtherViews(viewId: string) {
      this.views = removeBy(
        this.views,
        (view) => view.id !== viewId && view.closable,
      )
      this.activeViewById(viewId)
    },

    updateAllViews() {
      const menuStore = useMenuStore()
      const navMenuMap = menuStore.navMenuMap
      const refreshViews = this.views.map((item) => {
        if (navMenuMap[item.id]) {
          const { id, text, href } = navMenuMap[item.id]
          return {
            id,
            text,
            href,
            closable: item.closable,
          }
        }
        return item
      })
      this.views = refreshViews
    },

    setRefreshId(viewId: string | null) {
      this.refreshId = viewId
      if (viewId) {
        setTimeout(() => {
          this.refreshId = null
        }, 1000)
      }
    },

    windowOpen(href: string) {
      window.open(href)
    },
  },
})
