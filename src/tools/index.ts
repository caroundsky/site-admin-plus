/**
 * 容器对外的工具方法
 *
 * 只是把常见的 store 操作包一层，**供容器内部使用**（插件、宿主自己的代码）。
 * 方法自身不持有状态，操作的就是当前容器实例的 store。
 *
 * 两点注意：
 *  1. 依赖 activePinia，请在事件回调（如 `appMounted`）里调用，
 *     不要在插件 `effects` 阶段同步调用；
 *  2. 容器外的页面（iframe）不要用这里的方法 —— 走 postMessage 桥接，
 *     见 README 的「跨 iframe 调用」。
 *
 * 插件拿到的 `ctx.$tools` 就是这一份。
 */
export { ElMessage as message } from 'element-plus'
export { queryMenu } from './queryMenu'
export * as tab from './tab'
export type { QueryMenuConfig } from './queryMenu'
export type { TabConfig } from './tab'
