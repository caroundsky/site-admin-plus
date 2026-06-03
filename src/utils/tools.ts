import Cookies from 'js-cookie'
import { isPlainObject } from 'is-what'
import { isVNode as vueIsVNode } from 'vue'

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

export const on = function (
  element: HTMLElement | Document,
  event: string,
  handler: EventListener,
) {
  if (element && event && handler) {
    element.addEventListener(event, handler, false)
  }
}

export function removeCookie(name: string | string[]) {
  if (typeof name === 'string') {
    Cookies.remove(name)
  } else if (Array.isArray(name)) {
    name.forEach((c) => {
      Cookies.remove(c)
    })
  }
}

export function isVNode(node: any) {
  return vueIsVNode(node)
}

export function appendScript({
  doc,
  url,
  attrs,
  callback,
}: {
  doc: Document
  url: string
  attrs?: Record<string, string>
  callback?: (el: HTMLScriptElement) => void
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
        callback(this as HTMLScriptElement)
      })
    }

    doc.body.appendChild($s)
  } catch (_e) {
    // ignore errors
  }
}

export function reflashIframe(iframe: HTMLIFrameElement) {
  try {
    if (iframe.contentWindow?.location) {
      iframe.contentWindow.location.reload()
    } else if (iframe.src) {
      iframe.src = iframe.src
    }
  } catch (_e) {
    const _src = iframe.src
    iframe.setAttribute('src', '')
    setTimeout(function () {
      iframe.setAttribute('src', _src)
    }, 10)
  }
}

export function ensureArray<T>(
  items: (T | null | undefined)[] | T | null | undefined,
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
