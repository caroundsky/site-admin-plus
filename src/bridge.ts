/**
 * 跨 iframe 桥接的业务页入口（独立打包为 lib/bridge.js）
 *
 * 与库主入口分开，是为了让业务页**不必加载** vue / pinia / element-plus ——
 * iframe 里的页面可能是任意技术栈，为了调一个 addTab 而拉进整个容器 bundle
 * 并不现实。本入口只依赖 ./bridge/protocol 与 ./bridge/client，二者均无运行时依赖。
 *
 * 容器侧的实现（./bridge/server）不在这里导出：它依赖 pinia 与容器 store，
 * 属于主入口的一部分。
 *
 * 不想引入任何依赖时也可以不用它 —— 直接按协议 postMessage：
 *
 * ```js
 * window.parent.postMessage({ method: 'addTab', payload: { text: '订单', href: '/orders' } }, '*')
 * ```
 */
export { createBridge } from './bridge/client'
export type { Bridge, CreateBridgeOptions } from './bridge/client'

export {
  BRIDGE_METHODS,
  isBridgeMethod,
  isBridgeRequest,
  isBridgeResponse,
} from './bridge/protocol'

export type {
  BridgeMenuItem,
  BridgeMenuQuery,
  BridgeMethod,
  BridgePayloadMap,
  BridgeRequest,
  BridgeResponse,
  BridgeTabConfig,
} from './bridge/protocol'
