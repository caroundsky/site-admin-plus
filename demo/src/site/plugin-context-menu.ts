/**
 * 示例插件：菜单右键
 *
 * 库在「导航菜单项」和「页签」上各留了一个右键钩子，插件只需往
 * `bus.setContextMenu` 挂一个「按 view 返回按钮数组」的函数：
 *
 *   - menuItem    -> 左侧导航菜单项右键，view 只有 { id, href, text }
 *   - menuViewBar -> 顶部页签右键，view 是完整的 MenuView（含 closable）
 *
 * 定位、越界翻转、渲染、销毁都由库负责，插件只管「这一项该弹什么按钮」。
 * 每次右键都会调用一次该函数，所以可以按 view 的状态动态裁剪按钮。
 */
import { ElMessage } from 'element-plus'
import { Close, DocumentCopy, RefreshRight, TopRight } from '@element-plus/icons-vue'
import { useMenuViewsStore } from '@caroundsky/lemon-admin'
import type { ContextButton, MenuView, Plugin, SimpleMap } from '@caroundsky/lemon-admin'

/** 菜单 href 是相对路径（指向 public/pages 下的静态页），复制时补成绝对地址 */
const absoluteUrl = (href: string) => {
  try {
    return new URL(href, window.location.href).href
  } catch {
    return href
  }
}

const copyLink = async (view: MenuView) => {
  if (!view.href) {
    ElMessage.warning(`「${view.text}」是父级菜单，没有可以打开的链接`)
    return
  }

  const url = absoluteUrl(view.href)
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success(`已复制链接：${view.text}`)
  } catch {
    // 非 https 或浏览器未授权剪贴板时，退化为把链接显示出来
    ElMessage.info(url)
  }
}

/** 按钮定义表，两个钩子按需取用 */
const BUTTONS: SimpleMap<ContextButton> = {
  open: {
    label: '在容器中打开',
    icon: TopRight,
    onClick: (view) => {
      if (!view.href) {
        ElMessage.warning(`「${view.text}」是父级菜单，请展开后选择子菜单`)
        return
      }
      useMenuViewsStore().addViewById(view.id)
    },
  },
  refresh: {
    label: '刷新',
    icon: RefreshRight,
    onClick: (view) => useMenuViewsStore().setRefreshId(view.id),
  },
  copyLink: {
    label: '复制链接',
    icon: DocumentCopy,
    onClick: copyLink,
  },
  close: {
    label: '关闭',
    icon: Close,
    onClick: (view) => useMenuViewsStore().closeView(view),
  },
  closeOthers: {
    label: '关闭其他',
    onClick: (view) => useMenuViewsStore().closeOtherViews(view.id),
  },
}

export default function contextMenuPlugin(): Plugin {
  return {
    name: 'demo-context-menu',
    effects({ $bus }) {
      // 导航菜单项：此时多半还没开过页签，所以给「打开」而不是「刷新/关闭」
      $bus.setContextMenu['menuItem'] = () => [BUTTONS.open, BUTTONS.copyLink]

      // 页签：已经有 view 了，再按 closable 决定给不给关闭类动作
      // （首页页签 closable 为 false，不提供关闭）
      $bus.setContextMenu['menuViewBar'] = (view: MenuView) => {
        const buttons = [BUTTONS.refresh, BUTTONS.copyLink]
        if (view.closable !== false) {
          buttons.push(BUTTONS.close, BUTTONS.closeOthers)
        }
        return buttons
      }
    },
  }
}
