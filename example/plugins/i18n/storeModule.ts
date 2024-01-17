import { MutationTree, ActionTree, Module } from 'vuex'
import Cookie from 'js-cookie'
import i18n from './main'

interface State {
  locale: string
}

const validLocale = ['zh-CN', 'en-US']

const getLocale = () => {
  const cookieLocal = (Cookie.get('Culture') || '').replace('lang=', '')
  return cookieLocal || 'zh-CN'
}

const state = {
  locale: getLocale(),
}

const mutations: MutationTree<State> = {
  SET_LOCALE(state, locale: string) {
    state.locale = locale
    i18n.locale = locale
  },
}

const actions: ActionTree<State, any> = {
  setLocale({ commit }, local: any) {
    if (validLocale.includes(local)) {
      commit('SET_LOCALE', local)
    }
  },
}

const storeModule: Module<State, any> = {
  state,
  mutations,
  actions,
}
export default storeModule
