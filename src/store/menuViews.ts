import keyBy from 'lodash/keyBy'
import sortBy from 'lodash/sortBy'

import { GetterTree, MutationTree, ActionTree, Module } from 'vuex'
import { getField, updateField } from 'vuex-map-fields'
import { NavMenuItem, MenuView } from '~/types/interfaces'

import * as debug from '@/utils/debug'
import removeBy from '@/utils/removeBy'

import bus from '@/bus'

interface State {
  views: MenuView[]
  activeId: MenuView['id'] | null
  refreshId: MenuView['id'] | null
}

const state: State = {
  views: [],
  activeId: null,
  refreshId: null,
}

const getters: GetterTree<State, any> = {
  getField,
  viewsMap(state) {
    return keyBy(state.views, 'id')
  },
  activeView(state, getters) {
    return state.activeId ? getters.viewsMap[state.activeId] : null
  },
}

const mutations: MutationTree<State> = {
  updateField,
  ADD_VIEW(state, payload) {
    const views = [...state.views]
    views.push(payload)
    const FIXED_DRAG = bus.config.FIXED_DRAG ?? [bus.config.HOME_PAGE]
    // 对menuViews做一次排序，目的是筛出固定不动的页签，将他们排到最前面
    state.views = sortBy(views, [
      function (view) {
        return !FIXED_DRAG.includes(view.id)
      },
    ])
  },
  ACTIVE_VIEW_BY_ID(state, activeId) {
    state.activeId = activeId
  },
  CLOSE_VIEW(state, viewId) {
    state.views = removeBy(
      state.views,
      (view) => view.id === viewId && view.closable
    )
  },
  CLOSE_OTHER_VIEWS(state, viewId) {
    state.views = removeBy(
      state.views,
      (view) => view.id !== viewId && view.closable
    )
  },
  CLOSE_ALL_VIEWS() {
    state.views = removeBy(state.views, (view) => view.closable)
  },
  UPDATE_ALL_VIEWS(state, navMenuMap) {
    const refreshViews = state.views.map((item) => {
      if (navMenuMap[item.id]) {
        const { id, text, href } = navMenuMap[item.id]
        item = {
          id,
          text,
          href,
          closable: item.closable,
        }
      }
      return item
    })
    state.views = refreshViews
  },
  REFRESH_BY_ID(state, viewId) {
    state.refreshId = viewId
  },
}

const actions: ActionTree<State, any> = {
  async addView({ dispatch }, view: MenuView) {
    const { id } = await dispatch('addViewInBack', view)
    dispatch('activeViewById', id)
  },

  async addViewNoActice({ dispatch }, view: MenuView) {
    await dispatch('addViewInBack', view)
  },

  addViewInBack({ dispatch, commit, getters, rootGetters }, view: MenuView) {
    const { id, text, href, closable = true } = view
    if (!href) {
      return debug.error(`${JSON.stringify(view)} 未提供 'href' 属性`)
    }

    const viewId = id || text || href

    const getNavMenu = rootGetters['menu/navMenuMap'][viewId]
    if (getNavMenu && getNavMenu.isNewWindow) {
      return window.open(getNavMenu.href)
    }

    if (getters.viewsMap[viewId]) {
      return dispatch('activeViewById', viewId)
    } else {
      if (!text) {
        debug.warn(`${JSON.stringify(view)} 未提供 'text' 属性`)
        return
      }
      const newView = {
        id: viewId,
        text,
        href,
        closable,
      }
      commit('ADD_VIEW', newView)
      return newView
    }
  },

  addViewById({ dispatch, rootGetters }, menuId: MenuView['id']) {
    const menu: NavMenuItem = rootGetters['menu/navMenuMap'][menuId]
    if (menu) {
      return dispatch('addView', menu)
    }
  },

  addViewByIdNoActice({ dispatch, rootGetters }, menuId: MenuView['id']) {
    const menu: NavMenuItem = rootGetters['menu/navMenuMap'][menuId]
    if (menu) {
      return dispatch('addViewNoActice', menu)
    }
  },

  addViewInBackById({ dispatch, rootGetters }, menuId: MenuView['id']) {
    const menu: NavMenuItem = rootGetters['menu/navMenuMap'][menuId]
    if (menu) {
      return dispatch('addViewInBack', menu)
    }
  },

  activeView({ dispatch }, view: MenuView) {
    dispatch('activeViewById', view.id)
  },

  activeViewById({ commit, getters }, activeId: MenuView['id']) {
    const activeView = getters.viewsMap[activeId] || null
    if (activeView) {
      commit('ACTIVE_VIEW_BY_ID', activeId)
      bus.$emit('active-menu-view', activeView)
    }
    return activeView
  },

  closeView({ dispatch }, view: MenuView) {
    dispatch('closeViewById', view.id) // 关闭当前
    bus.$emit('close-menu-view', view)
  },

  closeViewById({ commit, dispatch }, viewId) {
    if (!viewId) {
      debug.warn(`${JSON.stringify(viewId)} 未提供 'id' 属性`)
      return
    }

    commit('CLOSE_VIEW', viewId)

    if (state.views.length !== 0 && state.activeId === viewId) {
      dispatch('activeViewById', state.views[state.views.length - 1].id) // 激活左侧menu
    }
  },

  closeAllViews({ commit, dispatch }) {
    commit('CLOSE_ALL_VIEWS')
    dispatch('activeViewById', bus.config.HOME_PAGE)
  },

  closeOtherViews({ commit, dispatch }, viewId) {
    commit('CLOSE_OTHER_VIEWS', viewId)
    dispatch('activeViewById', viewId)
  },

  updateAllViews({ commit, rootGetters }) {
    commit('UPDATE_ALL_VIEWS', rootGetters['menu/navMenuMap'])
  },

  setRefreshId({ commit }, viewId) {
    commit('REFRESH_BY_ID', viewId)
    setTimeout(() => {
      commit('REFRESH_BY_ID', null)
    }, 1000)
  },

  windowOpen({ commit }, href: MenuView['href']) {
    window.open(href)
  },
}

const storeModule: Module<State, any> = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}

export default storeModule
