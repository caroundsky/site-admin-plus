import { Plugin } from '~/types'
import buttons from './buttons'

export default function (): Plugin {
  return {
    effects({ $bus }) {
      // 设置菜单右键弹出按钮内容
      $bus.setContextMenu['menuItem'] = (view: any) =>
        buttons(view, ['windowOpen', 'collect'])

      // 设置menu-view-bar 右键弹出按钮内容
      $bus.setContextMenu['menuViewBar'] = (view: any) => buttons(view)
    },
  }
}
