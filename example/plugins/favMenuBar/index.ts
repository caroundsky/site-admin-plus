import { Plugin } from '~/types'
import storeModule from './storeModule'
import FavMenuBar from './FavMenuBar.vue'

export default function (): Plugin {
  return {
    name: 'favMenu',
    storeModule,
    slots: {
      'main-footer': FavMenuBar,
    },
    effects: ({ $store, $on }) => {
      $on('appMounted', () => {
        $store.dispatch('favMenu/initFavMenu')
      })
    },
  }
}
