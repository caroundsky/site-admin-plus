/**
 * 示例插件：用户信息 + 退出登录 + 主题切换
 *
 * 三件事：
 *  1. 把当前用户同步进 bus —— 容器操作栏的用户名是从 `bus.getState('username')` 读的
 *     （见库的 AppActionBar）。容器挂载时同步一次，覆盖「刷新后从 localStorage 恢复登录态」。
 *  2. 响应站点容器的退出登录钩子 —— 容器操作栏里的「退出登录」按钮会 `emit('logout')`，
 *     宿主在这里做真正的登出与跳转，无需自己再画一个退出按钮。
 *  3. 把主题切换挂到 `sys-dropdown`（设置下拉）里 —— 与容器「设置」的语义一致。
 *
 * 主题清单见同目录的 themes.ts。
 */
import type { Plugin, PluginCtx } from '@caroundsky/lemon-admin'
import router from '@/router'
import { authStore } from '@/stores/auth'
import ThemeSwitch from './ThemeSwitch.vue'

/** 把当前用户信息同步到 bus，供容器操作栏显示 */
export const syncUserToBus = (ctx: Pick<PluginCtx, '$bus'>) => {
  const auth = authStore()
  ctx.$bus.setState('username', auth.currentUser.name || '')
}

export default function userMenuPlugin(): Plugin {
  return {
    name: 'user-menu',
    slots: {
      'sys-dropdown': ThemeSwitch,
    },
    effects({ $bus, $on }) {
      $on('appCreateStart', () => {
        syncUserToBus({ $bus })
      })

      // 站点容器的退出登录钩子。
      // 库收到该事件后会清掉当前用户命名空间下的本地缓存；这里只需清理登录态并回登录页。
      $on('logout', () => {
        authStore().logout()
        router.push({ name: 'login' })
      })
    },
  }
}
