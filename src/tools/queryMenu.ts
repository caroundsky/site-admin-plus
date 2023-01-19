import { NavMenuItem } from '~/types/interfaces'
import { warn } from '@/utils/debug'
import bus from '@/bus'

interface queryConfig {
  id?: string
  name?: string
}

export function queryMenu(config: queryConfig) {
  const { id, name } = config
  const store = bus.getStore()
  const flatNavMenu: NavMenuItem[] = store.getters['menu/flatNavMenu']
  const navMenuMap: Record<string, NavMenuItem> =
    store.getters['menu/navMenuMap']
  let targetMune: NavMenuItem[] = []
  if (id) {
    targetMune = navMenuMap[id] ? [navMenuMap[id]] : []
  } else if (name) {
    targetMune = flatNavMenu.filter((menu: NavMenuItem) => menu.text === name)
  } else {
    warn('请传入菜单id或菜单名name')
  }
  return targetMune
}
