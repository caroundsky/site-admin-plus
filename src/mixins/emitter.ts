/**
 * 引用自elementUi的事件处理
 * https://sourcegraph.com/github.com/ElemeFE/element/-/blob/src/mixins/emitter.js
 *
 * dispatch 和 broadcast 方法都需要 3 个参数，componentName 组件名称， eventName 事件名称， params 传递的参数。
 * dispatch 方法会寻找所有的父组件，直到找到名称为 componentName 的组件，调用其 $emit() 事件。
 * broadcast 方法则是遍历当前组件的所有子组件，找到名称为 componentName 的子组件，然后调用其 $emit() 事件。
 */

import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Emitter extends Vue {
  dispatch(componentName: string, eventName: string, params: any) {
    let parent = this.$parent || this.$root
    let name = parent.$options._componentTag

    while (parent && (!name || name !== componentName)) {
      parent = parent.$parent

      if (parent) {
        name = parent.$options._componentTag
      }
    }
    if (parent) {
      // @ts-ignore
      parent.$emit.apply(parent, [eventName].concat(params))
    }
  }
  broadcast(componentName: string, eventName: string, params: any) {
    this.$children.forEach((child: any) => {
      let name = child.$options._componentTag

      if (name === componentName) {
        child.$emit.apply(child, [eventName].concat(params))
      } else {
        // @ts-ignore
        this.broadcast.apply(child, [componentName, eventName].concat([params]))
      }
    })
  }
}
