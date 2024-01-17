import { Plugin } from '~/types'
import storeModule from './storeModule'

export default function (): Plugin {
  return {
    name: 'i18n',
    storeModule,
  }
}
