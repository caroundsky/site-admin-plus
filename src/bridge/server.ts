/**
 * 容器侧的跨 iframe 桥接服务
 *
 * 业务页（iframe 内）发 `{ method, payload, id? }`，这里按 method 分发到容器能力，
 * 并把 `id` 原样回填到响应里（调用方据此配对）。
 *
 * 只做两条校验，都是默认就生效的：
 *
 *   1. **发起方必须是本容器渲染的 iframe** —— 用 `event.source` 反查 iframe 的
 *      name（容器把它设成了页签 id），并确认该页签属于本实例。没有这条，页面上
 *      任何第三方 iframe 都能指挥容器；
 *   2. **method 在允许列表内**（`bridge.methods`，默认全部）。
 *
 * origin **默认不限制**（任何来源都能调，响应也用 `'*'` 发回），需要收紧时配置
 * `bridge.origins`，届时白名单外的请求不回信、只打一条 warning。
 *
 * 另外，`closeTab` / `refreshTab` / `setTabTitle` 默认只能作用于**发起方自己**的
 * 页签：身份同样来自 `event.source` 反查，传别人的页签 id 会被拒。
 */
import { useMenuStore } from '@/stores/menu'
import { useMenuViewsStore } from '@/stores/menuViews'

import {
  BRIDGE_METHODS,
  isBridgeRequest,
  type BridgeMethod,
  type BridgeMenuItem,
  type BridgeResponse,
} from './protocol'

import { warn } from '@/utils/debug'

import type { Pinia } from 'pinia'

export interface BridgeServerOptions {
  /**
   * 允许的调用方 origin；特殊值 `'self'` 表示容器自身 origin。
   * **不配置 = 不限制**（默认）。
   */
  origins?: string[]
  /** 允许调用的方法，默认 `BRIDGE_METHODS` 全部 */
  methods?: BridgeMethod[]
}

export interface BridgeServer {
  /** 实际生效的 origin 白名单；`null` 表示不限制 */
  allowedOrigins: string[] | null
  destroy: () => void
}

/** 把 `'self'` 展开成当前 origin；未配置时返回 null 表示不限制 */
const resolveOrigins = (origins?: string[]): string[] | null => {
  if (!origins?.length) return null
  return origins.map((origin) =>
    origin === 'self' && typeof window !== 'undefined'
      ? window.location.origin
      : origin,
  )
}

/**
 * 转成可被结构化克隆的纯数据。
 *
 * store 里取出来的是 Vue 的响应式 Proxy，postMessage 的结构化克隆不支持 Proxy。
 * replacer 里的环检测也必需：菜单对象的 `parents`（父级链）指回祖先节点，
 * 是循环引用，JSON.stringify 会直接抛错。
 */
const toPlain = (value: unknown): unknown => {
  if (value === undefined) return undefined

  const seen = new WeakSet<object>()
  try {
    return JSON.parse(
      JSON.stringify(value, (_key, val) => {
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) return undefined
          seen.add(val)
        }
        return val
      }),
    )
  } catch {
    return null
  }
}

/** 菜单项：只回业务页用得上的字段，扁平结构、不含 children */
const pickMenuItem = (menu: Record<string, any>): BridgeMenuItem => ({
  id: menu.id,
  text: menu.text,
  href: menu.href,
  icon: menu.icon,
  show: menu.show,
})

/** 找到发起请求的 iframe 对应的页签 id */
const findSourceViewId = (source: MessageEventSource | null): string | null => {
  if (!source || typeof document === 'undefined') return null
  for (const frame of document.querySelectorAll('iframe')) {
    if (frame.contentWindow === source) return frame.name || null
  }
  return null
}

export function createBridgeServer(
  pinia: Pinia,
  options: BridgeServerOptions = {},
): BridgeServer {
  const allowedOrigins = resolveOrigins(options.origins)
  const allowedMethods = options.methods ?? [...BRIDGE_METHODS]

  const reply = (
    event: MessageEvent,
    request: { method: string; id?: string },
    ok: boolean,
    result?: unknown,
    error?: string,
  ) => {
    const target = event.source as Window | null
    if (!target?.postMessage) return

    const response: BridgeResponse = {
      method: request.method,
      ok,
      result: toPlain(result),
      error,
    }
    // 请求带了 id 就原样回填，便于调用方并发时按 id 配对
    if (request.id) response.id = request.id

    // 配了白名单就精确指定 origin，否则用 '*'
    target.postMessage(response, allowedOrigins ? event.origin : '*')
  }

  /** 只允许操作发起方自己的页签 */
  const resolveOwnViewId = (requested: unknown, ownId: string) => {
    if (!requested || requested === ownId) return ownId
    throw new Error(`页签 ${ownId} 只能操作自己，无权操作 ${String(requested)}`)
  }

  const handleRequest = (
    method: BridgeMethod,
    body: Record<string, any>,
    ownId: string,
  ) => {
    const menuStore = useMenuStore(pinia)
    const menuViewsStore = useMenuViewsStore(pinia)

    switch (method) {
      case 'addTab': {
        const { text, href, id: rawId, closable } = body
        if (!text || !href) throw new Error('addTab 需要 text 与 href')

        // 能匹配到菜单时以菜单 id 为准：否则「打开已存在的页签」会退化成再开一个
        const menu =
          (rawId && menuStore.navMenuMap[rawId]) ||
          menuStore.flatNavMenu.find((item) => item.text === text)

        menuViewsStore.addView({
          text,
          href,
          closable,
          id: menu?.id || rawId || text || href,
        })
        return undefined
      }

      case 'closeTab':
        menuViewsStore.closeViewById(resolveOwnViewId(body.id, ownId))
        return undefined

      case 'refreshTab':
        menuViewsStore.setRefreshId(resolveOwnViewId(body.id, ownId))
        return undefined

      case 'setTabTitle': {
        const { text } = body
        if (!text) throw new Error('setTabTitle 需要 text')
        menuViewsStore.setViewText(resolveOwnViewId(body.id, ownId), text)
        return undefined
      }

      case 'queryMenu': {
        const { id, name } = body
        if (id) {
          const menu = menuStore.navMenuMap[id]
          return menu ? [pickMenuItem(menu)] : []
        }
        if (name) {
          return menuStore.flatNavMenu
            .filter((item) => item.text === name)
            .map(pickMenuItem)
        }
        throw new Error('queryMenu 需要 id 或 name')
      }

      default:
        throw new Error(`未知方法 ${String(method)}`)
    }
  }

  const handleMessage = (event: MessageEvent) => {
    const data = event.data
    if (!isBridgeRequest(data)) return

    const { method, payload } = data

    // 白名单外的 origin：静默丢弃（不回信），只留一条告警方便排查配置
    if (allowedOrigins && !allowedOrigins.includes(event.origin)) {
      warn(
        `桥接：来自 ${event.origin} 的请求被拒绝（未在 bridge.origins 中配置）`,
      )
      return
    }

    if (!(allowedMethods as string[]).includes(method)) {
      reply(event, data, false, undefined, `方法 ${method} 未开放`)
      return
    }

    // 反查发起方：既是身份，也是「页签必须属于本实例」的隔离依据
    const ownId = findSourceViewId(event.source)
    if (!ownId || !useMenuViewsStore(pinia).viewsMap[ownId]) {
      reply(event, data, false, undefined, '发起方不是本容器实例管理的 iframe')
      return
    }

    try {
      reply(
        event,
        data,
        true,
        handleRequest(method as BridgeMethod, payload ?? {}, ownId),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      reply(event, data, false, undefined, message)
      warn(`桥接：${method} 执行失败 —— ${message}`)
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('message', handleMessage)
  }

  return {
    allowedOrigins,
    destroy: () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('message', handleMessage)
      }
    },
  }
}
