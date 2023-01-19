export interface SimpleMap<T> {
  [k: string]: T
}

/**
 * 选项菜单
 */
export interface NavMenuItem {
  /** 菜单ID */
  id: string

  /** 父级菜单ID */
  // NOTE: 站点容器菜单有 pid ，OA 菜单无 pid ，该属性似乎没用，暂时关闭
  // pid: string | number | null

  /** 子菜单 */
  children: NavMenuItem[]

  /** 菜单文字 */
  text: string

  /** 菜单地址 */
  href: string

  /** 末级菜单时是否显示帮助按钮 */
  help: boolean

  /** 帮助地址 */
  helpUrl: string

  /** 菜单图标 */
  icon: string

  /** 是否显示新菜单标识 */
  isNew: boolean

  /** 是否新窗口打开 */
  isNewWindow: boolean

  /** TODO: 是否显示菜单 */
  show: boolean

  /** 是否 OA 菜单 */
  isOa: boolean

  /** 是否叶子菜单节点 - 扁平化处理后新增 */
  isLeaf?: boolean

  /** 是否父级菜单节点 - 扁平化处理后新增 */
  isParent?: boolean

  /** 父级菜单链 - 扁平化处理后新增 */
  parents?: NavMenuItem[]

  /** 菜单全id组 - 扁平化处理后新增 */
  fullIds?: string[]
}

export interface MenuView {
  id: NavMenuItem['id']
  href: NavMenuItem['href']
  text: NavMenuItem['text']
  closable?: boolean
}

/**
 * 收藏菜单
 */
export interface FavNavMenuItem {
  id: NavMenuItem['id']
  text: NavMenuItem['text']
  href: NavMenuItem['href']
}

/**
 * 菜单搜索历史记录
 */
// export interface HistoryMenuItem {
//   id: NavMenuItem['id']
//   text?: NavMenuItem['text']
//   path?: NavMenuItem['text'][]
// }

export interface Theme {
  name: string
  darkText?: boolean
}

export interface ContextButton {
  label: string
  icon?: string
  onClick: Function
}
