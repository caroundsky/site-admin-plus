/**
 * 右键显示菜单
 * 注册到全局方便调用
 */
import Vue from 'vue'
import ContextMenu from './main.vue'

import { getOffset, queryDom, getOffsetWithDom } from '@/utils/tools'

const ContextMenuConstructor = Vue.extend(ContextMenu)
let lastInstance: any = null
let instance: any = null

const ContextmenuProxy: any = function (options: any) {
  instance = new ContextMenuConstructor()

  const {
    event,
    view, // 标签值
    definedBtn, // 自定义按钮
    afterDestory, // 删除实例回调
    queryClass, // 查询类
    setOffset, // 设置偏移值 {x: val, y: val}
    x, // 自定义x值
    y, // 自定义y值
    appendToBody, // 是否插入到body，默认是
    reference, // 计算距离使用的参照物
  } = options

  let _left = 0
  let _top = 0
  const _appendToBody = appendToBody === false ? false : true
  const _reference = reference ? reference : 'body'

  let el = event.target
  const compareEl = queryDom(el, _reference)
  // let el = event.path[9]
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
      // _left = setOffset ? setOffset.x : 0
      // _top = setOffset ? setOffset.y : 0
      _left = left + (setOffset ? setOffset.x : 0)
      _top = top + (setOffset ? setOffset.y : 0)
    }
  } else {
    _left = x
    _top = y
  }

  instance.view = view

  // 分配按钮
  instance.buttons = definedBtn || []

  // 销毁当前实例回调
  instance.$on('destroy', () => {
    afterDestory && afterDestory()
  })

  // 销毁上一个实例
  ContextmenuProxy.destroy(afterDestory)
  lastInstance = instance

  // 挂载显示
  instance.$mount()

  // 计算位置
  instance.style.left = _left
  instance.style.top = _top

  if (_appendToBody) {
    document.body.appendChild(instance.$el)
  } else {
    queryDom(el, 'nav-menu__submenu--pop').appendChild(instance.$el)
    // el.appendChild(instance.$el)
  }
  instance.visible = true

  instance.$on('mounted', () => {
    const $elHeight = instance.$el.clientHeight
    instance.visible = false

    if (_reference === 'body') {
      const $bottomDistance = window.innerHeight - getOffset(instance.$el).top

      if ($elHeight > Math.ceil($bottomDistance)) {
        instance.contrast = true

        if (_appendToBody) {
          _top = getOffset(el).top - $elHeight
        } else {
          _top = -$elHeight
        }
      }
    } else {
      const containerDom = queryDom(el, _reference)
      const $bottomDistance =
        containerDom.clientHeight - getOffset(instance.$el).top

      if ($elHeight > Math.ceil($bottomDistance)) {
        instance.contrast = true
        _top = _top - $elHeight - 20
      }
    }
    instance.style.top = _top

    instance.$nextTick(() => {
      instance.visible = true
    })
  })
}

ContextmenuProxy.destroy = function () {
  if (lastInstance) {
    const $el = lastInstance.$el
    lastInstance.$destroy()
    $el.parentNode && $el.parentNode.removeChild($el)
    lastInstance = null
  }
}

Vue.prototype.$contextmenu = ContextmenuProxy
