import Vue from 'vue'
import localforage from 'localforage'
import App from './app.vue'
import store from './store'
// import i18n from '@/i18n'
import i18n from './plugins/i18n/main'
import getMainDomain from '@/utils/getMainDomain'

import MenuData from './mock/menu'

import { create } from '~/src/main'
// import { create } from '../lib/index.mjs'
import '../lib/style.css'

import userDropdownMenuPlugin from './plugins/userDropdownMenu'
import netTestBtnPlugin from './plugins/netTestBtn'
import themesPlugin from './plugins/themes'
import favMenuBarPlugin from './plugins/favMenuBar'
import contextMenu from './plugins/contextMenu'
import MaskMenu from './plugins/maskMenu'
import I18n from './plugins/i18n'

import _logo from './logo.png'
import _logoSmall from './logo-sm.png'

Vue.config.productionTip = false
Vue.config.performance = true

try {
  document.domain = getMainDomain()
} catch (error) {}

const HOME_PAGE = '0255'
const app = create({
  store,
  plugins: [
    userDropdownMenuPlugin(),
    themesPlugin(),
    netTestBtnPlugin(),
    favMenuBarPlugin(),
    contextMenu(),
    MaskMenu(),
    I18n(),
  ],
  config: {
    logo: {
      type: 'img',
      normal: _logo,
      small: _logoSmall,
    },
    navMenu: {
      search: true,
      popoverLevel: 2,
      // 设置 popover 最大高度与屏幕的占比
      // popoverHeightRatio: 0.8,
      // 设置 popover 列最大宽度
      popoverColumnMaxWidth: 220,
      // 设置最大列数
      maxDepartNum: 3,
      popoverTrigger: 'click',
    },
    HOME_PAGE,
    FIXED_DRAG: [HOME_PAGE],
  },
})

app.$on('appCreateStart', (vm: any) => {
  const msg = app.$tools.message({
    message: '站点容器初始化中...',
    iconClass: 'el-icon-loading',
    customClass: 'bg-message bg-message--info',
    duration: 0,
  })

  const menus = MenuData.data
  app.$emit('setMenus', menus)

  msg.close()
})

app.$on('setMenusCompelet', (vm: any) => {
  app.$store.dispatch('menuViews/addViewById', HOME_PAGE)
})

app.$on('logout', async () => {
  await localforage.removeItem('SiteContainer/MenuLocalCache')
  alert('logout success')
})

Vue.component('SiteContainer', app.component)
Vue.prototype.$tools = app.$tools
window.$tools = { ...app.$tools }

new Vue({
  render: (h) => h(App),
  store,
  i18n,
}).$mount('#app')
