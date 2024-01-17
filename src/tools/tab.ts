import isFunction from 'lodash/isFunction'
import { queryMenu } from './queryMenu'
import bus from '@/bus'

interface tabConfig {
  text: string // 标签名
  href: string // url地址
  id?: string // id, 不携带则取text，href
  closable?: boolean // 是否可关闭
}

export function addTab(config: tabConfig, callback?: Function) {
  const { id, text: name } = config
  const store = bus.getStore()
  const targetMenu = queryMenu({ id, name })
  if (targetMenu.length !== 0) {
    config.id = targetMenu[0].id
  }
  store.dispatch('menuViews/addView', config).then(() => {
    isFunction(callback) && callback()
  })
}

export function closeTab(id: tabConfig['id'], callback?: Function) {
  const store = bus.getStore()
  store.dispatch('menuViews/closeViewById', id).then(() => {
    isFunction(callback) && callback()
  })
}
