import { useMenuViewsStore } from '@/stores/menuViews'
import { queryMenu } from './queryMenu'

import type { MenuView } from '@/types/interfaces'

export interface TabConfig {
  /** 标签名 */
  text: string
  /** url地址 */
  href: string
  /** id，不携带则取 text / href */
  id?: string
  /** 是否可关闭 */
  closable?: boolean
}

/**
 * 打开（已在页签栏则激活）一个页签
 *
 * 同 queryMenu，需在容器安装之后调用。
 */
export function addTab(config: TabConfig) {
  const menuViewsStore = useMenuViewsStore()

  // 能按 id / name 匹配到菜单时以菜单 id 为准：页签 id 与菜单 id 不一致的话，
  // 「打开已存在的页签」会退化成再开一个。
  const matched = queryMenu({ id: config.id, name: config.text })

  // 不复用入参对象：就地改写 config.id 会让复用同一个 config 的调用方串
  const view: MenuView = {
    ...config,
    id: matched.length
      ? matched[0].id
      : config.id || config.text || config.href,
  }

  menuViewsStore.addView(view)
}

/** 关闭页签 */
export function closeTab(id?: string) {
  useMenuViewsStore().closeViewById(id)
}
