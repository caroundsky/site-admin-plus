/**
 * 右键显示菜单
 * Vue 3 版本：createApp 挂载 main.vue，编排流程与 API 对齐 Vue2 旧版
 * （旧版 Vue.extend + 实例属性读写 → createApp + defineExpose 的 state）
 */
import { createApp, nextTick, type App } from 'vue'
import ContextMenuComponent from './main.vue'

import { getOffset, queryDom, getOffsetWithDom } from '@/utils/tools'

let lastApp: App | null = null
let lastContainer: HTMLElement | null = null

interface ContextMenuOptions {
  event: MouseEvent
  view?: any
  definedBtn?: any[]
  afterDestory?: () => void
  queryClass?: string
  setOffset?: { x: number; y: number }
  x?: number
  y?: number
  /** 是否插入到 body，默认是；为 false 时插入到 nav-menu__submenu--pop */
  appendToBody?: boolean
  /** 计算距离/翻转使用的参照物类名，默认 'body' */
  reference?: string
}

// main.vue 通过 defineExpose 暴露的实例状态（对应旧版的实例属性）
interface ContextMenuVm {
  state: {
    visible: boolean
    style: { left: number; top: number }
    contrast: boolean
  }
}

// queryDom 找不到目标时会一路走到根节点，这里封装一个可返回 null 的安全版本
const queryAncestor = (el: HTMLElement, queryClass: string) => {
  let cur: HTMLElement | null = el
  while (cur) {
    if (cur.classList && cur.classList.contains(queryClass)) return cur
    cur = cur.parentElement
  }
  return null
}

const ContextmenuProxy = function (options: ContextMenuOptions) {
  const {
    event,
    view,
    definedBtn,
    afterDestory,
    queryClass,
    setOffset,
    x,
    y,
    appendToBody,
    reference,
  } = options

  let _left = 0
  let _top = 0
  const _appendToBody = appendToBody !== false
  const _reference = reference || 'body'

  let el = event.target as HTMLElement
  const compareEl = queryDom(el, _reference)

  if (event) {
    if (queryClass) {
      el = queryDom(el, queryClass)
    }

    if (_appendToBody) {
      const { left, top } = getOffset(el)
      _left = Math.ceil(left) + (setOffset ? setOffset.x : 0)
      if (window.innerWidth - _left <= 121) {
        _left = window.innerWidth - 121
      }
      _top = top + el.clientHeight - 2 + (setOffset ? setOffset.y : 0)
    } else {
      const { left, top } = getOffsetWithDom(el, compareEl)
      _left = left + (setOffset ? setOffset.x : 0)
      _top = top + (setOffset ? setOffset.y : 0)
    }
  } else if (x !== undefined && y !== undefined) {
    _left = x
    _top = y
  }

  // 销毁上一个实例
  ContextmenuProxy.destroy()

  // 创建容器
  const container = document.createElement('div')

  // 创建新的 Vue 应用实例（回调中对 vm 的引用在挂载完成后才执行）
  const app = createApp(ContextMenuComponent, {
    view,
    buttons: definedBtn || [],
    // 对应旧版 instance.$on('destroy')：
    // Vue 3 没有 $destroy，组件 emit('destroy') 后在此同步卸载并移除 DOM
    onDestroy: () => {
      afterDestory && afterDestory()
      app.unmount()
      if (container.parentNode) {
        container.parentNode.removeChild(container)
      }
      if (lastApp === app) {
        lastApp = null
        lastContainer = null
      }
    },
    // 对应旧版 instance.$on('mounted') 的翻转逻辑
    onMounted: () => {
      // 再等一个 tick，确保 visible=true 的渲染已刷新（display:none 下测不到高度）
      nextTick(() => {
        const menuEl = container.querySelector('.bgcb-contextmenu')
        if (!menuEl) return

        const $elHeight = menuEl.clientHeight
        vm.state.visible = false

        if (_reference === 'body') {
          const $bottomDistance =
            window.innerHeight - getOffset(menuEl as HTMLElement).top

          if ($elHeight > Math.ceil($bottomDistance)) {
            vm.state.contrast = true
            _top = _appendToBody ? getOffset(el).top - $elHeight : -$elHeight
          }
        } else {
          const containerDom = queryDom(el, _reference)
          // 旧版公式把「容器高度」与「菜单文档 top」混减，坐标系不一致，
          // 竖版 pop 内恒判定为空间不足，菜单全部上翻到顶部。
          // 修正为同一坐标系（视窗坐标）：容器下沿 - 菜单上沿
          const $bottomDistance =
            containerDom.getBoundingClientRect().bottom -
            (menuEl as HTMLElement).getBoundingClientRect().top

          if ($elHeight > Math.ceil($bottomDistance)) {
            vm.state.contrast = true
            _top = _top - $elHeight - 20
          }
        }
        vm.state.style.top = _top

        nextTick(() => {
          vm.state.visible = true
        })
      })
    },
  })

  lastApp = app
  lastContainer = container

  // 挂载显示
  const vm = app.mount(container) as unknown as ContextMenuVm

  // 对应旧版 instance.style.left/top = _left/_top
  vm.state.style.left = _left
  vm.state.style.top = _top

  if (_appendToBody) {
    document.body.appendChild(container)
  } else {
    // 插入到 pop 容器内：鼠标移入右键菜单不至于触发 pop 的 mouseleave
    const popDom = queryAncestor(el, 'nav-menu__submenu--pop')
    ;(popDom || document.body).appendChild(container)
  }

  // 对应旧版 instance.visible = true
  vm.state.visible = true
}

ContextmenuProxy.destroy = function () {
  if (lastApp) {
    lastApp.unmount()
    lastApp = null
  }
  if (lastContainer && lastContainer.parentNode) {
    lastContainer.parentNode.removeChild(lastContainer)
  }
  lastContainer = null
}

// 导出到全局属性
export const useContextMenu = () => {
  return {
    show: ContextmenuProxy,
    destroy: ContextmenuProxy.destroy,
  }
}

export default ContextmenuProxy
