import type { Plugin } from '@caroundsky/lemon-admin'

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
          // 设置缓存命名空间：此后库写入的本地缓存都会带上该前缀，
          // 换账号登录不会读到上一个账号的数据；退出登录时自动清除。
          $bus.setUserKey(data.username)
        })
      })
    },
  }
}
