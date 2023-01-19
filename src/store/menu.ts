import keyBy from 'lodash/keyBy'
import intersectionBy from 'lodash/intersectionBy'

import { GetterTree, MutationTree, ActionTree, Module } from 'vuex'
import { getField, updateField } from 'vuex-map-fields'
import flattenTree from '@/utils/flattenTree'
import * as debug from '@/utils/debug'

import { NavMenuItem } from '~/types/interfaces'

import localforage from 'localforage'
import bus from '@/bus'

interface State {
  navMenu: NavMenuItem[]
  navMenuMode: { [key: string]: boolean }
  searchKeyword: string
  menuSearchPY: string[]
  menuSearchPYids: string[]
  menuSearchHistory: NavMenuItem[]
}

const state: State = {
  navMenu: [],

  // 菜单列表显示模式：存储格式为一级菜单的id Map 映射 例如 { '菜单id': true }
  // true -> 显示
  // false -> 隐藏
  navMenuMode: {},
  /**
   * 搜索查询相关
   */
  searchKeyword: '',
  menuSearchPY: [], // 关键词组
  menuSearchPYids: [], // 存储的父id组
  menuSearchHistory: [], // 历史记录
}

const getters: GetterTree<State, any> = {
  getField,
  // 扁平化
  flatNavMenu(state): NavMenuItem[] {
    return flattenTree(state.navMenu)
  },
  navMenuMap(state, getters) {
    return keyBy(getters['flatNavMenu'], 'id')
  },
}

const mutations: MutationTree<State> = {
  updateField,
  SET_NAV_MENU(state, payload) {
    state.navMenu = payload
  },
  SET_NAV_MENU_MODE(state, payload) {
    state.navMenuMode = payload
  },
  TOGGLE_MENU_SHOW(state, payload) {
    if (typeof payload === 'string') {
      state.navMenuMode[payload] = !state.navMenuMode[payload]
    } else if (typeof payload === 'boolean') {
      for (const key in state.navMenuMode) {
        state.navMenuMode[key] = payload
      }
    }

    // 缓存菜单列显示模式
    localforage.setItem('SiteContainer/navMenuMode', state.navMenuMode)
  },
  SET_MENU_SEARCH_PY(state, payload) {
    state.menuSearchPY = payload
  },
  SET_MENU_SEARCH_PY_IDS(state, payload) {
    state.menuSearchPYids = payload
  },
  SAVE_MENU_SEARCH_HISTORY(state, payload) {
    if (state.menuSearchHistory.some((item) => item.id === payload.id)) return
    state.menuSearchHistory.unshift(payload)
    // 缓存当前记录
    localforage.setItem(
      'SiteContainer/SearchLocalCache',
      state.menuSearchHistory
    )
  },
  INIT_MENU_SEARCH_HISTORY(state, payload) {
    state.menuSearchHistory = payload
  },
  SET_SEARCH_KEYWORD(state, payload) {
    state.searchKeyword = payload
  },
}

const actions: ActionTree<State, any> = {
  async setNavMenu({ commit }, payload) {
    if (Array.isArray(payload)) {
      let newObj = {}
      const navMenuModeCache: object | null = await localforage.getItem(
        'SiteContainer/navMenuMode'
      )
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

      commit('SET_NAV_MENU', payload)
      commit('SET_NAV_MENU_MODE', newObj)
      bus.$emit('setMenusCompelet')
    } else {
      debug.error('菜单数据不符合格式！')
    }
  },
  toggleMenuShow({ commit }, payload) {
    commit('TOGGLE_MENU_SHOW', payload)
  },
  setSearchKeyword({ commit }, payload) {
    commit('SET_SEARCH_KEYWORD', payload)
  },
  // 设置关键字组
  setMenuSearchPY({ commit }, payload) {
    if (Array.isArray(payload)) {
      commit('SET_MENU_SEARCH_PY', payload)
    }
  },
  // 设置父id组
  setMenuSearchPYids({ commit }, payload) {
    if (Array.isArray(payload)) {
      commit('SET_MENU_SEARCH_PY_IDS', payload)
    }
  },
  // 初始化搜索历史
  async initSearchHistory({ getters, commit }) {
    let result: any = await localforage.getItem(
      'SiteContainer/SearchLocalCache'
    )
    if (!result) return
    // 与当前登录对象的菜单栏数据作对比过滤一次，以新的菜单栏为准，取两者交集
    result = intersectionBy(getters.flatNavMenu, result, 'id')
    commit('INIT_MENU_SEARCH_HISTORY', result || [])
  },
  // 保存当前搜索
  saveMenuSearchHistory({ commit }, payload) {
    commit('SAVE_MENU_SEARCH_HISTORY', payload)
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
