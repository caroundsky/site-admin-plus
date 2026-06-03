/**
 * 事件派发/广播组合式函数
 * Vue 3 版本 - 使用事件总线替代原有的 dispatch/broadcast 模式
 *
 * 注意：Vue 3 移除了 $children，原有 broadcast 模式不再适用
 * 建议使用事件总线或 provide/inject 替代
 */

import bus from '@/bus'

/**
 * 向上派发事件到指定组件
 * @param componentName 目标组件名称
 * @param eventName 事件名称
 * @param params 传递的参数
 */
export function useDispatch() {
  const dispatch = (componentName: string, eventName: string, params: any) => {
    // 使用事件总线派发事件
    bus.emit(`${componentName}:${eventName}`, params)
  }

  return { dispatch }
}

/**
 * 监听来自父组件的事件
 * @param componentName 当前组件名称
 * @param eventName 事件名称
 * @param callback 回调函数
 */
export function useOnDispatch(
  componentName: string,
  eventName: string,
  callback: (params: any) => void,
) {
  bus.on(`${componentName}:${eventName}`, callback)
}

/**
 * 向下广播事件（使用事件总线）
 * @param componentName 目标组件名称
 * @param eventName 事件名称
 * @param params 传递的参数
 */
export function useBroadcast() {
  const broadcast = (componentName: string, eventName: string, params: any) => {
    bus.emit(`broadcast:${componentName}:${eventName}`, params)
  }

  return { broadcast }
}

/**
 * 监听来自父组件的广播事件
 * @param componentName 当前组件名称
 * @param eventName 事件名称
 * @param callback 回调函数
 */
export function useOnBroadcast(
  componentName: string,
  eventName: string,
  callback: (params: any) => void,
) {
  bus.on(`broadcast:${componentName}:${eventName}`, callback)
}

/**
 * 兼容旧版本的 Emitter 组合式函数
 * 提供与原 mixin 相同的接口
 */
export function useEmitter(componentName?: string) {
  const { dispatch } = useDispatch()
  const { broadcast } = useBroadcast()

  // 如果提供了组件名称，返回便捷方法
  if (componentName) {
    return {
      dispatch: (eventName: string, params: any) =>
        dispatch(componentName, eventName, params),
      broadcast: (eventName: string, params: any) =>
        broadcast(componentName, eventName, params),
    }
  }

  return { dispatch, broadcast }
}
