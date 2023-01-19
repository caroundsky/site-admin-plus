/**
 * 菜单数据混入
 * 1、接收在NavMenu注入的this实例
 * 2、接收参数menuData： 当前菜单数据
 * 3、计算返回当前id和所有父级id的数组（没有父级则返回本身）
 */

import { Vue, Prop, InjectReactive, Component } from 'vue-property-decorator'

import { NavMenuItem } from '~/types/interfaces'

@Component
export default class MenuMixin extends Vue {
  @InjectReactive('rootMenu') rootMenu!: any

  @Prop({ default: () => {}, required: true })
  public menuData!: NavMenuItem

  public index: string = this.menuData.id

  get menuDataFlat(): any {
    let result: NavMenuItem[] = []
    const flat = (tree: NavMenuItem) => {
      if (!tree.children) return
      tree.children.forEach((node) => {
        if (!node || !node.show) return
        result.push(node)
        flat(node)
      })
    }
    flat(this.menuData)
    return result
  }

  get indexPath(): string[] {
    // 获取父级路径的id
    const path = [this.index]
    let parent: any = this.$parent
    // 只在非顶级的数据中进行过滤
    while (parent.$options._componentTag !== 'NavMenu') {
      if (parent.index) {
        path.unshift(parent.index)
      }
      parent = parent.$parent
    }
    return path
  }

  get fullText(): string {
    // 获取全路径
    let fullPath = this.menuData.text
    let parent: any = this.$parent
    while (parent.$options._componentTag !== 'NavMenu') {
      if (parent.index) {
        fullPath = `${parent.menuData.text} > ${fullPath}`
      }
      parent = parent.$parent
    }
    return fullPath
  }
}
