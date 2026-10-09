/**
 * 示例插件：main-footer 插槽
 *
 * 库的布局在内容区下方留了 <PluginSlot name="main-footer" />，
 * 位置在容器主区域底部（页签栏与操作栏之外），适合放版权、状态栏一类信息。
 *
 * 插槽组件通过 `slots` 注册，同名插槽可以注册多个组件，会按注册顺序依次渲染；
 * 组件运行在容器组件树内，因此可以直接用库的 store / bus。
 */
import type { Plugin } from '@caroundsky/lemon-admin'
import MainFooter from './MainFooter.vue'

export default function footerPlugin(): Plugin {
  return {
    name: 'demo-footer',
    slots: {
      'main-footer': MainFooter,
    },
  }
}
