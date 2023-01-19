import { Plugin } from '~/types'
import storeModule from './storeModule'
import ThemeSwitchController from './ThemeSwitchController.vue'
// import './themes.less'

export default function (): Plugin {
  return {
    name: 'themes',
    storeModule,
    slots: {
      'sys-dropdown': ThemeSwitchController,
    },
    effects({ $on, $store }) {
      $on('appCreateEnd', () => $store.dispatch('themes/init'))
    },
  }
}
