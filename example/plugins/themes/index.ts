import type { Plugin } from '~/types'
import { useThemesStore } from './storeModule'
import ThemeSwitchController from './ThemeSwitchController.vue'

export default function (): Plugin {
  return {
    name: 'themes',
    slots: {
      'sys-dropdown': ThemeSwitchController,
    },
    effects({ $on }) {
      $on('appCreateEnd', () => {
        const themesStore = useThemesStore()
        themesStore.init()
      })
    },
  }
}
