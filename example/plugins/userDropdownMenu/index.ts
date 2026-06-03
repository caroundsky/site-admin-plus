import type { Plugin } from '~/types'

import { useUserStore } from './storeModule'
import UserDropdownMenu from './UserDropdownMenu.vue'

import UserData from '../../mock/user'

export default function user(): Plugin {
  const getUserInfo = () => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(UserData.data), 1000),
    )
  }

  return {
    name: 'user',
    slots: {
      'user-dropdown': UserDropdownMenu,
    },
    effects({ $bus, $on }) {
      $on('appCreateStart', () => {
        getUserInfo().then((data: any) => {
          const userStore = useUserStore()
          userStore.initUserInfo(data)
          $bus.setState('avatar', data.avatar)
          $bus.setState('username', data.username)
        })
      })
    },
  }
}
