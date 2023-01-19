import Cookies from 'js-cookie'
import Vue from 'vue'
import { isPlainObject } from 'is-what'

export function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

export function getElementsByClassName(className: string) {
  const els = []
  for (const el of document.getElementsByClassName(className) || []) {
    els.push(el)
  }
  return els
}

export function getOffset(el: HTMLElement) {
  const box = el.getBoundingClientRect()
  return {
    top: box.top + window.pageYOffset - document.documentElement.clientTop,
    left: box.left + window.pageXOffset - document.documentElement.clientLeft,
  }
}

export function getOffsetParent(el: HTMLElement) {
  return { left: el.offsetLeft, top: el.offsetTop }
}

export function getOffsetWithDom(el: HTMLElement, compareEl: HTMLElement) {
  const box = el.getBoundingClientRect()
  const tarBox = compareEl.getBoundingClientRect()

  const boxTop =
    box.top + window.pageYOffset - document.documentElement.clientTop
  const boxLeft =
    box.left + window.pageXOffset - document.documentElement.clientLeft
  const tarBoxTop =
    tarBox.top + window.pageYOffset - document.documentElement.clientTop
  const tarBoxLeft =
    tarBox.left + window.pageXOffset - document.documentElement.clientLeft

  return {
    top: boxTop - tarBoxTop,
    left: boxLeft - tarBoxLeft,
  }
}

export function queryDom(el: HTMLElement, queryClass: string) {
  while (!el.classList.contains(queryClass) && el.parentElement) {
    el = el.parentElement
  }
  return el
}

export const on = (function () {
  // @ts-ignore
  if (document.addEventListener) {
    return function (element: HTMLElement, event: any, handler: any) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    }
  } else {
    return function (element: any, event: any, handler: Function) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler)
      }
    }
  }
})()

export function removeCookie(name: string | Array<string>) {
  if (typeof name === 'string') {
    Cookies.remove(name)
  } else if (Array.isArray(name)) {
    name.forEach((c) => {
      Cookies.remove(c)
    })
  }
}

export function isVNode(node: any) {
  const vm = new Vue()
  const emptyVNode = vm.$createElement()
  return node instanceof emptyVNode.constructor
}

export function appendScript({
  doc,
  url,
  attrs,
  callback,
}: {
  doc: Document
  url: string
  attrs?: Object
  callback?: Function
}) {
  try {
    const $s = document.createElement('script')
    $s.src = url
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        $s.setAttribute(key, attrs[key])
      })
    }

    if (typeof callback === 'function') {
      $s.addEventListener('load', function () {
        callback(this)
      })
    }

    doc.body.appendChild($s)
  } catch (e) {}
}

export function reflashIframe(iframe: any) {
  try {
    if (iframe.location) {
      iframe.location.reload(true)
    } else if (iframe.contentWindow.location.reload) {
      iframe.contentWindow.location.reload(true)
    } else if (iframe.src) {
      iframe.src = iframe.src
    } else {
      alert('Sorry, unable to reload that frame!')
    }
  } catch (e) {
    const _src = iframe.src
    iframe.setAttribute('src', '')
    setTimeout(function () {
      iframe.setAttribute('src', _src)
    }, 10)
  }
}

export function ensureArray<T>(
  items: (T | null | undefined)[] | T | null | undefined
): T[] {
  if (Array.isArray(items)) {
    return items.filter(Boolean) as T[]
  }
  if (items) {
    return [items]
  }
  return []
}

export function hasOwn(obj: any, property: string | number | symbol) {
  if (!isPlainObject(obj)) return false
  return Object.prototype.hasOwnProperty.call(obj, property)
}
