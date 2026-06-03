/**
 * 菜单数据组合式函数
 * 替代原有的 menuMixin
 *
 * 功能：
 * 1、接收在 NavMenu 注入的 rootMenu 实例
 * 2、接收参数 menuData：当前菜单数据
 * 3、计算返回当前 id 和所有父级 id 的数组（没有父级则返回本身）
 */

import {
  inject,
  computed,
  type Ref,
  ref,
  getCurrentInstance,
  onMounted,
} from 'vue'
import type { NavMenuItem } from '~/types/interfaces'

interface RootMenu {
  popoverLevel: number
  asideMenuOpen: boolean
  horizon: boolean
  menuSearchPY: string[]
  [key: string]: any
}

export interface MenuComposableReturn {
  rootMenu: RootMenu
  index: Ref<string>
  menuDataFlat: Ref<NavMenuItem[]>
  indexPath: Ref<string[]>
  fullText: Ref<string>
}

/**
 * 菜单组合式函数
 * @param menuData 菜单数据
 */
export function useMenu(menuData: Ref<NavMenuItem>) {
  // 注入根菜单实例
  const rootMenu = inject<RootMenu>('rootMenu')

  // 当前菜单 id
  const index = computed(() => menuData.value.id)

  // 扁平化子菜单
  const menuDataFlat = computed<NavMenuItem[]>(() => {
    const result: NavMenuItem[] = []
    const flat = (tree: NavMenuItem) => {
      if (!tree.children) return
      tree.children.forEach((node) => {
        if (!node || !node.show) return
        result.push(node)
        flat(node)
      })
    }
    flat(menuData.value)
    return result
  })

  // 父级路径 - 使用 inject/provide 模式或事件总线
  // Vue 3 中无法直接访问父组件链，需要通过 provide/inject 传递
  const indexPath = ref<string[]>([index.value])
  const fullText = ref<string>(menuData.value.text)

  // 在挂载时从父组件获取路径信息
  onMounted(() => {
    const instance = getCurrentInstance()
    if (instance) {
      // 通过 provide/inject 获取父级路径
      const parentIndexPath = inject<Ref<string[]>>('parentIndexPath', ref([]))
      const parentFullText = inject<Ref<string>>('parentFullText', ref(''))

      if (parentIndexPath.value.length > 0) {
        indexPath.value = [...parentIndexPath.value, index.value]
      }

      if (parentFullText.value) {
        fullText.value = `${parentFullText.value} > ${menuData.value.text}`
      }
    }
  })

  return {
    rootMenu: rootMenu!,
    index,
    menuDataFlat,
    indexPath,
    fullText,
  }
}

/**
 * 为父级菜单提供的路径注入函数
 * 用于向子组件传递路径信息
 */
export function useMenuProvide(
  menuData: Ref<NavMenuItem>,
  indexPath: Ref<string[]>,
  fullText: Ref<string>,
) {
  const { provide } = require('vue')

  // 向子组件提供当前路径信息
  provide('parentIndexPath', indexPath)
  provide('parentFullText', fullText)
  provide('parentMenuData', menuData)
}
