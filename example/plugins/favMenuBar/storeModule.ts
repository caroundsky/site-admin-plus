/**
 * 收藏
 */
import keyBy from 'lodash/keyBy'
import intersection from 'lodash/intersection'

import { GetterTree, MutationTree, ActionTree, Module } from 'vuex'
import { getField, updateField } from 'vuex-map-fields'
import { MenuView, FavNavMenuItem } from '~/types/interfaces'

import bus from '@/bus'

import removeBy from '@/utils/removeBy'

interface State {
  favMenu: FavNavMenuItem[]
  defaultOpen: FavNavMenuItem['id'][]
  defaultHome: FavNavMenuItem['id'] | null
}

const state: State = {
  favMenu: [],
  defaultOpen: [],
  defaultHome: '',
}

const getters: GetterTree<State, any> = {
  getField,
  favMenuMap(state) {
    return keyBy(state.favMenu, 'id')
  },
}

const mutations: MutationTree<State> = {
  updateField,
  ADD_FAV(state, menu: MenuView) {
    state.favMenu.push({
      id: menu.id,
      text: menu.text,
      href: menu.href,
    })
  },
  DEL_FAV(state, menu: MenuView) {
    state.favMenu = removeBy(state.favMenu, (item) => item.id == menu.id)
  },
  SET_DEFAULT_OPEN(state, menuId: FavNavMenuItem['id']) {
    const oldVal = new Set(state.defaultOpen)
    state.defaultOpen = [...oldVal.add(menuId)]
  },
  UNSET_DEFAULT_OPEN(state, menuId: FavNavMenuItem['id']) {
    state.defaultOpen = removeBy(state.defaultOpen, (id) => id === menuId)
  },
  SET_DEFAULT_HOME(state, menuId: FavNavMenuItem['id'] | null) {
    state.defaultHome = menuId
  },
  INIT_FAV(state, initData) {
    const { cacheFav, cacheDefaultOpen, cacheDefaultHome } = initData
    state.favMenu = cacheFav || []
    state.defaultOpen = cacheDefaultOpen || []
    state.defaultHome = cacheDefaultHome || bus.config.HOME_PAGE
  },
}

export const actions: ActionTree<State, any> = {
  // 初始化
  async initFavMenu({ commit, rootGetters }) {
    // 如果需要持久化，在此处配置local或者接口
    let cacheFav: Array<FavNavMenuItem> = []

    if (cacheFav) {
      const navMenuMap = rootGetters['menu/navMenuMap']
      cacheFav = cacheFav.filter((item) => navMenuMap[item.id])
    }

    const cacheFavIds = cacheFav && cacheFav.map((item) => item.id)

    // 如果需要持久化，在此处配置local或者接口
    let cacheDefaultOpen: Array<FavNavMenuItem['id']> = []
    // 如果需要持久化，在此处配置local或者接口
    const cacheDefaultHome: FavNavMenuItem['id'] | null = null

    cacheDefaultOpen = intersection(cacheFavIds, cacheDefaultOpen)

    commit('INIT_FAV', { cacheFav, cacheDefaultOpen, cacheDefaultHome })
  },

  // 初始化默认打开和默认首页
  initOpenAndHome({ state, dispatch }) {
    state.defaultOpen.forEach((id) => {
      dispatch('menuViews/addViewByIdNoActice', id, { root: true })
    })
    setTimeout(() => {
      dispatch('menuViews/activeViewById', state.defaultHome, { root: true })
    }, 0)
  },

  async addFav({ commit }, view: MenuView) {
    const newFav = {
      id: view.id,
      text: view.text,
      href: view.href,
    }
    try {
      commit('ADD_FAV', newFav)
    } catch (e) {}
  },

  delFav({ commit, dispatch }, view: MenuView) {
    // 如果需要持久化，在此处配置local或者接口
    // 取消收藏时同时清除默认开启和默认首页
    commit('DEL_FAV', view)
    dispatch('unsetDefaultOpen', view.id)
    dispatch('unsetDefaultHome', view.id)
  },

  setDefaultOpen({ commit }, menuId: FavNavMenuItem['id']) {
    commit('SET_DEFAULT_OPEN', menuId)
  },

  unsetDefaultOpen({ commit }, menuId: FavNavMenuItem['id']) {
    commit('UNSET_DEFAULT_OPEN', menuId)
  },

  setDefaultHome({ commit }, menuId: FavNavMenuItem['id']) {
    commit('SET_DEFAULT_HOME', menuId)
  },

  unsetDefaultHome({ commit }) {
    commit('SET_DEFAULT_HOME', null)
  },
}

const storeModule: Module<State, any> = {
  state,
  getters,
  mutations,
  actions,
}

export default storeModule
