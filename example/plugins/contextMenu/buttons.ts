/**
 * 右键按钮事件统一处理
 */
import { ElMessage } from 'element-plus'
import {
  RefreshRight,
  Close,
  CopyDocument,
  Star,
  Check,
} from '@element-plus/icons-vue'
import type { MenuView, ContextButton, SimpleMap } from '~/types/interfaces'
import { useMenuViewsStore } from '@/stores/menuViews'
import { useFavMenuStore } from '../favMenuBar/storeModule'
import { useMenuStore } from '@/stores/menu'
import bus from '@/bus'

const AllButtonsMap: SimpleMap<ContextButton> = {
  refresh: {
    label: '刷新',
    icon: RefreshRight,
    onClick: (view: MenuView) => {
      const menuViewsStore = useMenuViewsStore()
      menuViewsStore.setRefreshId(view.id)
    },
  },
  close: {
    label: '关闭',
    icon: Close,
    onClick: (view: MenuView) => {
      const menuViewsStore = useMenuViewsStore()
      menuViewsStore.closeView(view)
    },
  },
  closeOther: {
    label: '关闭其他',
    onClick: (view: MenuView) => {
      const menuViewsStore = useMenuViewsStore()
      menuViewsStore.closeOtherViews(view.id)
    },
  },
  closeAll: {
    label: '关闭所有',
    onClick: (view: MenuView) => {
      const menuViewsStore = useMenuViewsStore()
      menuViewsStore.closeAllViews()
    },
  },
  windowOpen: {
    label: '新窗口打开',
    icon: CopyDocument,
    onClick: (view: MenuView) => {
      const menuViewsStore = useMenuViewsStore()
      menuViewsStore.windowOpen(view.href)
    },
  },
  collect: {
    label: '设为常用',
    icon: Star,
    onClick: (view: MenuView) => {
      const favMenuStore = useFavMenuStore()
      favMenuStore.addFav(view)
      ElMessage.success(`菜单 "${view.text}" 收藏成功！`)
    },
  },
}

const linkageBtns: SimpleMap<ContextButton> = {
  cancelCollect: {
    label: '取消收藏',
    onClick: (view: MenuView) => {
      const favMenuStore = useFavMenuStore()
      favMenuStore.delFav(view)
      ElMessage.success(`菜单 "${view.text}" 已取消收藏！`)
    },
  },
  defaultOpen: {
    label: '设为默认打开',
    onClick: function (this: ContextButton, view: MenuView) {
      const favMenuStore = useFavMenuStore()
      if (this.icon) {
        favMenuStore.unsetDefaultOpen(view.id)
        favMenuStore.unsetDefaultHome(view.id)
      } else {
        favMenuStore.setDefaultOpen(view.id)
      }
    },
  },
  defaultHome: {
    label: '设为默认首页',
    onClick: function (this: ContextButton, view: MenuView) {
      const favMenuStore = useFavMenuStore()
      if (this.icon) {
        favMenuStore.unsetDefaultHome(view.id)
      } else {
        favMenuStore.setDefaultHome(view.id)
        favMenuStore.setDefaultOpen(view.id)
      }
    },
  },
}

const getButtons = (view: MenuView, filterKey?: Array<string>) => {
  const {
    config: { HOME_PAGE },
  } = bus

  const menuStore = useMenuStore()
  const favMenuStore = useFavMenuStore()

  let btn: SimpleMap<ContextButton> = {}
  const favMenuMap = favMenuStore.favMenuMap
  const defaultOpenMap = favMenuStore.defaultOpen
  const defaultHome = favMenuStore.defaultHome
  const { id, closable } = view

  if (id === HOME_PAGE) {
    for (const key in AllButtonsMap) {
      if (['refresh', 'closeOther', 'closeAll'].includes(key)) {
        btn[key] = AllButtonsMap[key]
      }
    }
  } else {
    if (filterKey) {
      for (const key in AllButtonsMap) {
        if (filterKey.includes(key)) {
          btn[key] = AllButtonsMap[key]
        }
      }
    } else {
      btn = { ...AllButtonsMap }
    }
  }

  // btn要属于menu数据范围内，不属于则禁止收藏
  if (!menuStore.navMenuMap[id]) {
    delete btn['collect']
  }

  if (!closable) {
    delete btn['close']
  }

  Object.keys(favMenuMap).forEach((key) => {
    if (key === id) {
      delete btn.collect
      Object.assign(btn, linkageBtns)

      // 默认打开
      if (defaultOpenMap.includes(key)) {
        btn['defaultOpen'].icon = Check
      } else {
        delete btn['defaultOpen'].icon
      }

      // 默认首页
      if (key === defaultHome) {
        btn['defaultHome'].icon = Check
      } else {
        delete btn['defaultHome'].icon
      }
    }
  })
  return Object.values(btn)
}

export default getButtons
