import { Plugin } from '~/types'

import storeModule from './storeModule'
import UserDropdownMenu from './UserDropdownMenu.vue'

import UserData from '../../mock/user'

export default function user(): Plugin {
  const getUserInfo = () => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(UserData.data), 1000)
    )
  }

  return {
    name: 'user',
    storeModule,
    slots: {
      'user-dropdown': UserDropdownMenu,
    },
    effects({ $bus, $on, $emit, $store }) {
      $on('appCreateStart', () => {
        getUserInfo().then((data: any) => {
          $store.dispatch('user/initUserInfo', data)
          $bus.setState('avatar', data.avatar)
          $bus.setState('username', data.username)
        })
      })
    },
  }
}
