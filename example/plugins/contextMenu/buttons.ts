/**
 * 右键按钮事件统一处理
 */
import { Store } from 'vuex'
import { MenuView, ContextButton, SimpleMap } from '~/types/interfaces'
import { Message } from 'element-ui'
import bus from '@/bus'

let store: Store<any>

const AllButtonsMap = {
  refresh: {
    label: '刷新',
    icon: 'el-icon-refresh-right',
    onClick: (view: MenuView) => {
      store.dispatch('menuViews/setRefreshId', view.id)
    },
  },
  close: {
    label: '关闭',
    icon: 'el-icon-close',
    onClick: (view: MenuView) => {
      store.dispatch('menuViews/closeView', view)
    },
  },
  closeOther: {
    label: '关闭其他',
    onClick: (view: MenuView) => {
      store.dispatch('menuViews/closeOtherViews', view.id)
    },
  },
  closeAll: {
    label: '关闭所有',
    onClick: (view: MenuView) => {
      store.dispatch('menuViews/closeAllViews', view.id)
    },
  },
  windowOpen: {
    label: '新窗口打开',
    icon: 'fa fa-clone',
    onClick: (view: MenuView) => {
      store.dispatch('menuViews/windowOpen', view.href)
    },
  },
  collect: {
    label: '设为常用',
    icon: 'fa fa-heart',
    onClick: (view: MenuView) => {
      store.dispatch('favMenu/addFav', view)
      Message.success(`菜单 “${view.text}” 收藏成功！`)
    },
  },
}

const linkageBtns = {
  cancelCollect: {
    label: '取消收藏',
    onClick: (view: MenuView) => {
      store.dispatch('favMenu/delFav', view)
      Message.success(`菜单 “${view.text}” 已取消收藏！`)
    },
  },
  defaultOpen: {
    label: '设为默认打开',
    onClick: function (view: MenuView) {
      if (this.hasOwnProperty('icon')) {
        store.dispatch('favMenu/unsetDefaultOpen', view.id)
        store.dispatch('favMenu/unsetDefaultHome')
      } else {
        store.dispatch('favMenu/setDefaultOpen', view.id)
      }
    },
  },
  defaultHome: {
    label: '设为默认首页',
    onClick: function (view: MenuView) {
      if (this.hasOwnProperty('icon')) {
        store.dispatch('favMenu/unsetDefaultHome')
      } else {
        store.dispatch('favMenu/setDefaultHome', view.id)
        store.dispatch('favMenu/setDefaultOpen', view.id)
      }
    },
  },
}

const getButtons = (view: MenuView, filterKey?: Array<string>) => {
  store = bus.getStore()
  const {
    config: { HOME_PAGE },
  } = bus

  let btn: SimpleMap<ContextButton> = {}
  const favMenuMap = store.getters['favMenu/favMenuMap']
  const defaultOpenMap = store.state.favMenu.defaultOpen
  const defaultHome = store.state.favMenu.defaultHome
  const { id, closable } = view

  if (id === HOME_PAGE) {
    for (const key in AllButtonsMap) {
      // 首页只取刷新，关闭其他和关闭所有
      if (['refresh', 'closeOther', 'closeAll'].includes(key)) {
        // @ts-ignore
        btn[key] = AllButtonsMap[key]
      }
    }
  } else {
    if (filterKey) {
      for (const key in AllButtonsMap) {
        if (filterKey.includes(key)) {
          // @ts-ignore
          btn[key] = AllButtonsMap[key]
        }
      }
    } else {
      btn = { ...AllButtonsMap }
    }
  }

  // btn要属于menu数据范围内，不属于则禁止收藏
  if (!store.getters['menu/navMenuMap'][id]) {
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
        btn['defaultOpen'].icon = 'el-icon-check'
      } else {
        delete btn['defaultOpen'].icon
      }

      // 默认首页
      if (key === defaultHome) {
        btn['defaultHome'].icon = 'el-icon-check'
      } else {
        delete btn['defaultHome'].icon
      }
    }
  })
  return Object.values(btn)
}

export default getButtons
