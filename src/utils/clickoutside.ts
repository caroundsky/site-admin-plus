/**
 * 来自
 * https://github.com/ElemeFE/element/blob/dev/src/utils/clickoutside.js
 */
import Vue from 'vue'
import { on } from './tools'
import { DirectiveBinding } from 'vue/types/options'

const nodeList: HTMLElement[] = []
const includeNode: HTMLElement[] = [] // 白名单 -- 新增
const ctx = '@@clickoutsideContext'

let startClick: Event
let seed = 0

!Vue.prototype.$isServer &&
  on(document, 'mousedown', (e: Event) => (startClick = e))

!Vue.prototype.$isServer &&
  on(document, 'mouseup', (e: Event) => {
    nodeList.forEach((node) => node[ctx].documentHandler(e, startClick))
  })

function createDocumentHandler(
  el: HTMLElement,
  binding: DirectiveBinding,
  vnode: any
) {
  return function(mouseup: any = {}, mousedown: any = {}) {
    if (
      !vnode ||
      !vnode.context ||
      !mouseup.target ||
      !mousedown.target ||
      el.contains(mouseup.target) ||
      el.contains(mousedown.target) ||
      el === mouseup.target ||
      (vnode.context.popperElm &&
        (vnode.context.popperElm.contains(mouseup.target) ||
          vnode.context.popperElm.contains(mousedown.target)))
    )
      return

    for (let i = 0; i < includeNode.length; i++) {
      const dom = includeNode[i]
      if (
        dom.contains(mouseup.target) ||
        dom.contains(mousedown.target) ||
        dom === mouseup.target
      )
        return
    }

    if (
      binding.expression &&
      el[ctx].methodName &&
      vnode.context[el[ctx].methodName]
    ) {
      vnode.context[el[ctx].methodName]()
    } else {
      el[ctx].bindingFn && el[ctx].bindingFn()
    }
  }
}

/**
 * v-clickoutside
 * @desc 点击元素外面才会触发的事件
 * @example
 * ```vue
 * <div v-element-clickoutside="handleClose">
 * ```
 */
export default {
  bind(el: HTMLElement, binding: DirectiveBinding, vnode: any) {
    nodeList.push(el)
    const id = seed++
    el[ctx] = {
      id,
      documentHandler: createDocumentHandler(el, binding, vnode),
      methodName: binding.expression,
      bindingFn: binding.value
    }
  },

  inserted(el: HTMLElement, binding: DirectiveBinding) {
    // @ts-ignore
    includeNode.push(document.getElementById(binding.arg))
  },

  update(el: HTMLElement, binding: DirectiveBinding, vnode: any) {
    el[ctx].documentHandler = createDocumentHandler(el, binding, vnode)
    el[ctx].methodName = binding.expression
    el[ctx].bindingFn = binding.value

    // @ts-ignore
    includeNode.push(document.getElementById(binding.arg))
  },

  unbind(el: HTMLElement) {
    let len = nodeList.length

    for (let i = 0; i < len; i++) {
      if (nodeList[i][ctx].id === el[ctx].id) {
        nodeList.splice(i, 1)
        break
      }
    }
    delete el[ctx]
  }
}
