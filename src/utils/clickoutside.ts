/**
 * 来自 Element Plus
 * Vue 3 版本的点击外部指令
 *
 * 指令钩子名称变更：
 * - bind → beforeMount
 * - inserted → mounted
 * - update → updated
 * - unbind → unmounted
 */
import type { DirectiveBinding } from 'vue'
import { on } from './tools'

interface ClickoutsideElement extends HTMLElement {
  [key: symbol]: {
    id: number
    documentHandler: (mouseup: Event, mousedown: Event) => void
    methodName: string
    bindingFn: () => void
  }
}

interface ClickoutsideBindingValue {
  handler: () => void
  include?: () => HTMLElement[]
}

const nodeList: ClickoutsideElement[] = []
const includeNode: HTMLElement[] = []

let startClick: Event
let seed = 0

const ctx = Symbol('clickoutsideContext')

if (typeof document !== 'undefined') {
  on(document as any, 'mousedown', (e: Event) => (startClick = e))
  on(document as any, 'mouseup', (e: Event) => {
    nodeList.forEach((node) => node[ctx].documentHandler(e, startClick))
  })
}

function createDocumentHandler(
  el: HTMLElement,
  binding: DirectiveBinding<ClickoutsideBindingValue | (() => void)>,
) {
  return function (
    mouseup: Event = {} as Event,
    mousedown: Event = {} as Event,
  ) {
    const target = mouseup.target as Node
    const mousedownTarget = mousedown.target as Node

    if (
      !mouseup.target ||
      !mousedown.target ||
      el.contains(target) ||
      el.contains(mousedownTarget) ||
      el === target
    ) {
      return
    }

    for (let i = 0; i < includeNode.length; i++) {
      const dom = includeNode[i]
      if (
        dom.contains(target) ||
        dom.contains(mousedownTarget) ||
        dom === target
      ) {
        return
      }
    }

    const bindingValue = binding.value
    if (typeof bindingValue === 'function') {
      bindingValue()
    } else if (bindingValue && typeof bindingValue.handler === 'function') {
      bindingValue.handler()
    }
  }
}

/**
 * v-clickoutside
 * @desc 点击元素外面才会触发的事件
 * @example
 * ```vue
 * <div v-clickoutside="handleClose">
 * ```
 */
export default {
  beforeMount(
    el: ClickoutsideElement,
    binding: DirectiveBinding<ClickoutsideBindingValue | (() => void)>,
  ) {
    nodeList.push(el)
    const id = seed++
    el[ctx] = {
      id,
      documentHandler: createDocumentHandler(el, binding),
      methodName: '',
      bindingFn:
        typeof binding.value === 'function'
          ? binding.value
          : binding.value?.handler || (() => {}),
    }
  },

  mounted(
    el: ClickoutsideElement,
    binding: DirectiveBinding<ClickoutsideBindingValue | (() => void)>,
  ) {
    // 添加白名单元素
    if (binding.arg) {
      const includeEl = document.getElementById(binding.arg)
      if (includeEl) {
        includeNode.push(includeEl)
      }
    }
  },

  updated(
    el: ClickoutsideElement,
    binding: DirectiveBinding<ClickoutsideBindingValue | (() => void)>,
  ) {
    el[ctx].documentHandler = createDocumentHandler(el, binding)
    el[ctx].bindingFn =
      typeof binding.value === 'function'
        ? binding.value
        : binding.value?.handler || (() => {})
  },

  unmounted(el: ClickoutsideElement) {
    const len = nodeList.length
    for (let i = 0; i < len; i++) {
      if (nodeList[i][ctx].id === el[ctx].id) {
        nodeList.splice(i, 1)
        break
      }
    }
    delete el[ctx]
  },
}
