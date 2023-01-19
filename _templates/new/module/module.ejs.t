---
to: src/store/modules/<%= h.inflection.dasherize(name) %>.ts
---
import { GetterTree, MutationTree, ActionTree } from 'vuex'

interface State {}

// export const mapFields = true

export const state: State = {}

export const getters: GetterTree<State, any> = {}

export const mutations: MutationTree<State> = {}

export const actions: ActionTree<State, any> = {}
