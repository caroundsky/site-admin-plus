/**
 * 跨 iframe 桥接的消息协议
 *
 * 刻意保持极简 —— 请求就是 `{ method, payload }`，容器按 method 分发：
 *
 * ```js
 * window.parent.postMessage({ method: 'addTab', payload: { text: '订单', href: '/orders' } }, '*')
 * ```
 *
 * 不带 source 标识、协议版本、请求 id：调用方多半是别技术栈的页面，期望的是
 * 「发一条消息就完事」，而不是先读懂一套信封格式。
 *
 * 代价是响应无法与请求严格配对（没有 id）：并发发两个同 method 的请求时，只能
 * 按先后顺序认领响应。对「点一下按钮查一次菜单」这类用法足够；确实需要严格配对时，
 * 请在 payload 里带业务 id 自行约定。
 *
 * 本文件保持零运行时依赖：它同时被打包进容器的 lib/index.js 和业务页用的
 * lib/bridge.js，业务页不会加载 vue / pinia / element-plus。
 */

/** 容器开放给 iframe 的方法（bridge.methods 的默认值） */
export const BRIDGE_METHODS = [
  'addTab',
  'closeTab',
  'queryMenu',
  'refreshTab',
  'setTabTitle',
] as const

export type BridgeMethod = (typeof BRIDGE_METHODS)[number]

/** 页签配置（与 tools 的 TabConfig 结构一致，此处独立声明以保证 SDK 零依赖） */
export interface BridgeTabConfig {
  text: string
  href: string
  /** 不传则按 text 匹配菜单 */
  id?: string
  closable?: boolean
}

export interface BridgeMenuQuery {
  id?: string
  name?: string
}

/**
 * 桥接返回的菜单项：扁平、只带业务页用得上的字段。
 *
 * 容器内部的菜单对象带 `parents`（父级链）等扁平化辅助字段，既冗余又构成循环
 * 引用，过不了 postMessage 的结构化克隆。
 */
export interface BridgeMenuItem {
  id: string
  text: string
  href: string
  icon?: string
  show?: boolean
  [key: string]: unknown
}

export interface BridgePayloadMap {
  addTab: BridgeTabConfig
  closeTab: { id?: string }
  queryMenu: BridgeMenuQuery
  refreshTab: { id?: string }
  /** 改自己的页签标题 */
  setTabTitle: { text: string; id?: string }
}

/** 业务页发出的请求 */
export interface BridgeRequest<M extends BridgeMethod = BridgeMethod> {
  method: M
  payload?: BridgePayloadMap[M]
  /**
   * 请求 id，**可选**：带上它容器会原样回填到响应里，并发时可按 id 精确配对。
   * 不带也能用，只是响应只能按 method 认领（SDK 会自己生成）。
   */
  id?: string
}

/**
 * 容器的响应。
 *
 * `ok` 既是成功标志，也是与请求互相区分的依据（请求没有 ok 字段）。
 */
export interface BridgeResponse {
  method: string
  ok: boolean
  result?: unknown
  error?: string
  /** 原样回填请求里的 id；请求没带则为 undefined（结构化克隆会直接省掉该字段） */
  id?: string
}

/** 生成请求 id：时间戳 + 自增序号，够用且便于排查 */
let seq = 0
export const createMessageId = () =>
  `${Date.now().toString(36)}-${(++seq).toString(36)}`

export const isBridgeMethod = (value: unknown): value is BridgeMethod =>
  (BRIDGE_METHODS as readonly string[]).includes(value as string)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/** 只认「有 method、且没有 ok」的消息，页面上其余 postMessage 一律忽略 */
export const isBridgeRequest = (data: unknown): data is BridgeRequest =>
  isRecord(data) && typeof data.method === 'string' && !('ok' in data)

/** 响应：有 method 且有布尔 ok */
export const isBridgeResponse = (data: unknown): data is BridgeResponse =>
  isRecord(data) &&
  typeof data.method === 'string' &&
  typeof data.ok === 'boolean'
