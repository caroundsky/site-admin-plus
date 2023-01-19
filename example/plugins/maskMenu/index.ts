import { Plugin } from '~/types'
import MaskMenu from './maskMenu.vue'

export default function (): Plugin {
  return {
    name: 'favMenu',
    slots: {
      'container-slot': MaskMenu,
    },
  }
}
