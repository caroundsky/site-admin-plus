/**
 * 示例插件：在站点容器的用户下拉插槽里放一个「退出登录」
 */
import type { Plugin } from '@caroundsky/lemon-admin'
import UserMenu from './UserMenu.vue'

export default function userMenuPlugin(): Plugin {
  return {
    name: 'user-menu',
    slots: {
      'user-dropdown': UserMenu,
    },
  }
}
