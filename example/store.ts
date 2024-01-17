import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  strict: import.meta.env.NODE_ENV !== 'production',
})

export default store
