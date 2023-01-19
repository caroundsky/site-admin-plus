import { GetterTree, MutationTree, ActionTree, Module } from 'vuex'
import { getField, updateField } from 'vuex-map-fields'

interface State {
  userInfo:
    | {
        userId: string
        oaId: string
        username: string
        employeeName: string
        avatar: string
        email: string
      }
    | {}
}

const state: State = {
  userInfo: {},
}

const getters: GetterTree<State, any> = {
  getField,
  userInfo(state) {
    return state.userInfo
  },
}

const mutations: MutationTree<State> = {
  updateField,
  SET_USER_INFO(state, payload) {
    state.userInfo = payload
  },
}

const actions: ActionTree<State, any> = {
  async initUserInfo({ commit }, userInfo) {
    commit('SET_USER_INFO', userInfo)
  },
}

const storeModule: Module<State, any> = {
  state,
  getters,
  mutations,
  actions,
}

export default storeModule
