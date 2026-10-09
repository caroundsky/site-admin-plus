import { warn } from '@/utils/debug'
import { useMenuStore } from '@/stores/menu'

import type { NavMenuItem } from '@/types/interfaces'

export interface QueryMenuConfig {
  /** 菜单 id，优先于 name */
  id?: string
  /** 菜单名（精确匹配 text） */
  name?: string
}

/**
 * 按 id 或菜单名查询菜单项
 *
 * 直接用容器的 store，所以要在容器已安装之后调用 —— 插件请放在事件回调
 * （如 `appMounted`）里，不要在 `effects` 阶段同步调用。
 */
export function queryMenu(config: QueryMenuConfig): NavMenuItem[] {
  const { id, name } = config
  const menuStore = useMenuStore()

  if (id) {
    const menu = menuStore.navMenuMap[id]
    return menu ? [menu] : []
  }

  if (name) {
    return menuStore.flatNavMenu.filter((menu) => menu.text === name)
  }

  warn('请传入菜单id或菜单名name')
  return []
}
