/**
 * 跨 iframe 桥接的业务页客户端
 *
 * 打包成独立的 `lib/bridge.js`，**零运行时依赖**。不引入它也行 —— 直接
 * postMessage 即可，`id` 带上就能和响应精确配对：
 *
 * ```js
 * window.parent.postMessage(
 *   { method: 'addTab', payload: { text: '订单详情', href: '/order/123' }, id: 'my-1' },
 *   '*', // 容器配了 bridge.origins 时这里换成容器的 origin
 * )
 * ```
 *
 * SDK 多做的事就是：自动生成 `id`、按 id 配对响应、加超时兜底。
 */
import {
  createMessageId,
  isBridgeResponse,
  type BridgeMenuItem,
  type BridgeMenuQuery,
  type BridgeMethod,
  type BridgePayloadMap,
  type BridgeRequest,
  type BridgeTabConfig,
} from './protocol'

export interface CreateBridgeOptions {
  /**
   * 容器所在窗口，默认 `window.parent`。
   * 容器自己也被嵌在更外层时，按实际层级传 `window.parent.parent` 之类。
   */
  target?: Window
  /**
   * 容器页面的 origin，作为 postMessage 的 targetOrigin。
   * 默认 `'*'`；容器配置了 `bridge.origins` 时必须填，否则容器不会回信。
   */
  origin?: string
  /** 单个请求的超时时间（毫秒），默认 10000 */
  timeout?: number
}

interface PendingEntry {
  resolve: (value: unknown) => void
  reject: (reason: Error) => void
  timer: ReturnType<typeof setTimeout>
}

export interface Bridge {
  /** 打开（已存在则激活）一个页签 */
  addTab: (config: BridgeTabConfig) => Promise<void>
  /** 关闭页签，不传 id 表示关自己 */
  closeTab: (id?: string) => Promise<void>
  /** 改页签标题，不传 id 表示改自己 */
  setTabTitle: (text: string, id?: string) => Promise<void>
  /** 刷新页签，不传 id 表示刷新自己 */
  refreshTab: (id?: string) => Promise<void>
  /** 按 id 或菜单名查询菜单 */
  queryMenu: (query: BridgeMenuQuery) => Promise<BridgeMenuItem[]>
  /** 摘掉消息监听，释放 pending 的请求 */
  destroy: () => void
}

export function createBridge(options: CreateBridgeOptions = {}): Bridge {
  const { origin = '*', timeout = 10000 } = options
  const target = options.target ?? window.parent

  // 每个请求都自带 id，响应按 id 精确配对（并发同 method 也不会串）
  const pending = new Map<string, PendingEntry>()

  const handleMessage = (event: MessageEvent) => {
    const data = event.data
    if (!isBridgeResponse(data) || !data.id) return

    const entry = pending.get(data.id)
    if (!entry) return

    pending.delete(data.id)
    clearTimeout(entry.timer)

    if (data.ok) {
      entry.resolve(data.result)
    } else {
      entry.reject(
        new Error(
          `[lemon-bridge] ${data.method} 失败：${data.error ?? '未知错误'}`,
        ),
      )
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('message', handleMessage)
  }

  const request = <M extends BridgeMethod>(
    method: M,
    payload?: BridgePayloadMap[M],
  ): Promise<unknown> =>
    new Promise((resolve, reject) => {
      const id = createMessageId()

      const entry: PendingEntry = {
        resolve,
        reject,
        timer: setTimeout(() => {
          pending.delete(id)
          reject(
            new Error(
              `[lemon-bridge] ${method} 超时（${timeout}ms）：` +
                '请确认容器已开启 bridge 配置，且当前页面 origin 在白名单内',
            ),
          )
        }, timeout),
      }

      pending.set(id, entry)

      const message: BridgeRequest<M> = { method, payload, id }
      target.postMessage(message, origin)
    })

  return {
    addTab: (config) => request('addTab', config).then(() => undefined),
    closeTab: (id) => request('closeTab', { id }).then(() => undefined),
    setTabTitle: (text, id) =>
      request('setTabTitle', { text, id }).then(() => undefined),
    refreshTab: (id) => request('refreshTab', { id }).then(() => undefined),
    queryMenu: (query) =>
      request('queryMenu', query) as Promise<BridgeMenuItem[]>,
    destroy: () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('message', handleMessage)
      }
      pending.forEach((entry) => clearTimeout(entry.timer))
      pending.clear()
    },
  }
}
