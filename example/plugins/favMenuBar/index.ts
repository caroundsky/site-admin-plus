import type { Plugin } from '~/types'
import { useFavMenuStore } from './storeModule'
import FavMenuBar from './FavMenuBar.vue'

export default function (): Plugin {
  return {
    name: 'favMenu',
    slots: {
      'main-footer': FavMenuBar,
    },
    effects({ $on }) {
      $on('appMounted', () => {
        const favMenuStore = useFavMenuStore()
        favMenuStore.initFavMenu()
      })
    },
  }
}
