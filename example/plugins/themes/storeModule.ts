import { GetterTree, MutationTree, ActionTree, Module } from 'vuex'
import keyBy from 'lodash/keyBy'
import { Theme } from './types'

interface State {
  allThemes: readonly Theme[]
  currentTheme: keyof typeof THEMES_MAP
}

const THEMES: Theme[] = [
  // Basic theme
  { name: 'default' },
  { name: 'primary' },
  { name: 'gray' },
  { name: 'red' },

  // Gradient theme
  { name: 'grow-early' },
  { name: 'plum-plate' },
  { name: 'midnight-bloom' },
  { name: 'night-sky' },
  { name: 'slick-carbon' },
  { name: 'royal' },
]
const THEMES_MAP = keyBy(THEMES, 'name')

const state: State = {
  allThemes: Object.freeze(THEMES),
  currentTheme: 'default',
}

const getters: GetterTree<State, any> = {}

const mutations: MutationTree<State> = {
  CHANGE_THEME(state, newThemeName) {
    state.currentTheme = newThemeName
  },
}

const actions: ActionTree<State, any> = {
  init({ dispatch }) {
    dispatch('updateBodyThemeName')
  },
  changeTheme({ commit, dispatch }, newThemeName: string) {
    if (THEMES_MAP[newThemeName]) {
      commit('CHANGE_THEME', newThemeName)
      dispatch('updateBodyThemeName')
    }
  },
  updateBodyThemeName({ state }) {
    // prettier-ignore
    document.body.className = document.body.className.replace(/\s?theme-[\w-]+/g, '')
    document.body.classList.add(`theme-${state.currentTheme}`)
  },
}

const storeModule: Module<State, any> = {
  state,
  getters,
  mutations,
  actions,
}

export default storeModule
