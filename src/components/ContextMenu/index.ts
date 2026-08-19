/**
 * 右键显示菜单
 * Vue 3 版本
 */
import { createApp, h, Transition, defineComponent, ref, type App } from 'vue'
import { ElIcon } from 'element-plus'

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
  appendToBody?: boolean
  reference?: string
}

// 定义菜单组件
const ContextMenuComponent = defineComponent({
  name: 'ContextMenu',
  props: {
    view: { type: Array, default: () => [] },
    buttons: { type: Array, default: () => [] },
    position: { type: Object, default: () => ({ left: '0px', top: '0px' }) },
  },
  emits: ['destroy'],
  setup(props, { emit }) {
    const visible = ref(true)

    const destroy = () => {
      visible.value = false
      setTimeout(() => {
        emit('destroy')
      }, 300)
    }

    const handleItemClick = (item: any) => {
      if (item && typeof item.onClick === 'function') {
        item.onClick(props.view)
      }
      destroy()
    }

    return () =>
      h(
        Transition,
        { name: 'bgcb__dropdown-trans' },
        {
          default: () =>
            visible.value
              ? h(
                  'div',
                  {
                    class: 'bgcb-contextmenu',
                    style: {
                      position: 'fixed',
                      left: props.position.left,
                      top: props.position.top,
                      zIndex: 9999,
                      background: '#fff',
                      borderRadius: '3px',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.23)',
                      minWidth: '120px',
                    },
                    onMouseleave: destroy,
                  },
                  [
                    h(
                      'ul',
                      {
                        style: {
                          listStyle: 'none',
                          padding: 0,
                          margin: 0,
                        },
                      },
                      (props.buttons as any[]).map((item, index) =>
                        h(
                          'li',
                          {
                            key: index,
                            style: {
                              padding: '8px 15px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              lineHeight: '1.5',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            },
                            onMouseenter: (e: MouseEvent) => {
                              ;(e.target as HTMLElement).style.background =
                                '#f5f5f5'
                            },
                            onMouseleave: (e: MouseEvent) => {
                              ;(e.target as HTMLElement).style.background =
                                'transparent'
                            },
                            onClick: () => handleItemClick(item),
                          },
                          [
                            item.icon
                              ? typeof item.icon === 'string'
                                ? h('i', {
                                    class: item.icon,
                                    style: { width: '13px' },
                                  })
                                : h(
                                    ElIcon,
                                    { style: { width: '13px' } },
                                    { default: () => h(item.icon) },
                                  )
                              : null,
                            h('span', item.label),
                          ],
                        ),
                      ),
                    ),
                  ],
                )
              : null,
        },
      )
  },
})

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
  lastContainer = container

  // 创建新的 Vue 应用实例
  const app = createApp({
    render() {
      return h(ContextMenuComponent, {
        view,
        buttons: definedBtn || [],
        position: {
          left: _left + 'px',
          top: _top + 'px',
        },
        onDestroy: () => {
          afterDestory && afterDestory()
          ContextmenuProxy.destroy()
        },
      })
    },
  })

  lastApp = app
  app.mount(container)

  if (_appendToBody) {
    document.body.appendChild(container)
  } else {
    const targetContainer = queryDom(el, 'nav-menu__submenu--pop')
    if (targetContainer) {
      targetContainer.appendChild(container)
    }
  }
}

ContextmenuProxy.destroy = function () {
  if (lastContainer && lastContainer.parentNode) {
    lastContainer.parentNode.removeChild(lastContainer)
  }
  if (lastApp) {
    lastApp.unmount()
    lastApp = null
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
