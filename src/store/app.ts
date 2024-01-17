import { MutationTree, ActionTree, Module } from 'vuex'
import bus from '@/bus'

interface State {
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

const state: State = {
  initStatus: '',
  isInited: false, // 初始化化完成
  isAsideMenu: true, // 开启侧边栏模式
  isAsideMenuOpen: true, // 侧边栏打开/收缩
  isUserSet: false, // 用户自主设置isAsideMenuOpen,用作resize时的侧边栏自动收回判断条件
  isMenuMaskOpen: false, // 菜单选择遮罩层
  menuKey: 0, // 菜单键，用于更新菜单
  menuTabTouch: false, // Tab菜单按住时，用于拖拽显示iframe遮罩以及删除当前tab栏目
  menuTabMoveInArea: false, // 菜单拖拽时，菜单在指定区域内，用于拖拽显示iframe遮罩
}

const mutations: MutationTree<State> = {
  UPDATE_INIT_STATUS(state, status: string) {
    state.initStatus = status
  },
  INIT_DONE(state) {
    state.initStatus = ''
    state.isInited = true
  },
  INIT_APP(state, isAsideMenu) {
    state.isAsideMenu = isAsideMenu
  },
  TOGGLE_NAV_MENU_LAYOUT(state) {
    state.isAsideMenu = !state.isAsideMenu
    localStorage.setItem(
      'SiteContainer/defaulAsideMenu',
      state.isAsideMenu ? '1' : ''
    )
  },
  TOGGLE_SIDE_MENU(state) {
    state.isAsideMenuOpen = !state.isAsideMenuOpen
  },
  USER_SET(state) {
    state.isUserSet = !state.isUserSet
  },
  TOGGLE_MASK_MENU(state) {
    state.isMenuMaskOpen = !state.isMenuMaskOpen
  },
  UPDATE_MENU_KEY(state) {
    state.menuKey++
  },
  SET_MENU_TAB_TOUCH(state, val) {
    state.menuTabTouch = val
  },
  SET_MENU_TAB_MOVE_IN_AREA(state, val) {
    state.menuTabMoveInArea = val
  },
}

const actions: ActionTree<State, any> = {
  setInitStatus({ commit }, status: string) {
    commit('UPDATE_INIT_STATUS', status)
  },
  initDone({ commit }) {
    commit('INIT_DONE')
  },
  init({ commit }) {
    let isAsideMenu
    if (bus.config.navMenu?.disableLayoutSwitch) {
      isAsideMenu = bus.config.navMenu?.defaultAside
    } else {
      const local = localStorage.getItem('SiteContainer/defaulAsideMenu')
      isAsideMenu = local === null ? bus.config.navMenu?.defaultAside : local
    }

    commit('INIT_APP', !!isAsideMenu)
  },
  toggleNavMenuLayout({ commit }) {
    commit('TOGGLE_NAV_MENU_LAYOUT')
  },
  toggleSideMenu({ commit }) {
    commit('TOGGLE_SIDE_MENU')
  },
  userSet({ commit }) {
    commit('USER_SET')
  },
  toggleMaskMenu({ commit }) {
    commit('TOGGLE_MASK_MENU')
  },
  updateMenuKey({ commit }) {
    commit('UPDATE_MENU_KEY')
  },
  setMenuTabTouch({ commit }, val: boolean) {
    commit('SET_MENU_TAB_TOUCH', val)
  },
  setMenuTabMoveInArea({ commit }, val: boolean) {
    commit('SET_MENU_TAB_MOVE_IN_AREA', val)
  },
}

const storeModule: Module<State, any> = {
  namespaced: true,
  state,
  mutations,
  actions,
}

export default storeModule
