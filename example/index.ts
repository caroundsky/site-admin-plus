import { createApp } from 'vue'
import localforage from 'localforage'
import App from './app.vue'

// import i18n from '@/i18n'
import i18n from './plugins/i18n/main'
import getMainDomain from '@/utils/getMainDomain'

import MenuData from './mock/menu'

import { createLibrary } from '~/src/main'
// import { createLibrary } from '~/lib'
// import '../lib/index.css'

import userDropdownMenuPlugin from './plugins/userDropdownMenu'
import netTestBtnPlugin from './plugins/netTestBtn'
import themesPlugin from './plugins/themes'
import favMenuBarPlugin from './plugins/favMenuBar'
import contextMenu from './plugins/contextMenu'
import MaskMenu from './plugins/maskMenu'
import I18n from './plugins/i18n'

import _logo from './logo.png'
import _logoSmall from './logo-sm.png'

try {
  document.domain = getMainDomain()
} catch (_error) {}

const HOME_PAGE = '0255'

// 创建库实例（不自动创建 app）
const library = createLibrary({
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
      popoverColumnMaxWidth: 230,
      // 设置最大列数
      maxDepartNum: 3,
      popoverTrigger: 'click',
    },
    HOME_PAGE,
    FIXED_DRAG: [HOME_PAGE],
  },
})

console.log('[example/index.ts] library created')

// 事件监听
library.bus.on('appCreateStart', () => {
  console.log('[example/index.ts] appCreateStart received')

  const msg = library.$tools.message({
    message: '站点容器初始化中...',
    customClass: 'bg-message bg-message--info',
    duration: 0,
  })

  const menus = MenuData.data
  console.log(
    '[example/index.ts] emitting setMenus with',
    menus.length,
    'items',
  )
  library.bus.emit('setMenus', menus)

  // 延迟关闭消息，确保菜单设置完成
  setTimeout(() => {
    console.log('[example/index.ts] closing message')
    msg.close()
  }, 100)
})

library.bus.on('setMenusCompelet', () => {
  console.log('[example/index.ts] setMenusCompelet received')
  const menuViewsStore = library.store.menuViewsStore()
  menuViewsStore.addViewById(HOME_PAGE)
})

library.bus.on('logout', async () => {
  await localforage.removeItem('SiteContainer/MenuLocalCache')
  alert('logout success')
})

// 创建 Vue 应用，使用自定义的 App 组件
const app = createApp(App)

// 安装库到应用
library.install(app)

// 使用 i18n
app.use(i18n)

// 挂载全局 tools
app.config.globalProperties.$tools = library.$tools
window.$tools = { ...library.$tools }

// 挂载应用到 DOM
app.mount('#app')

console.log('[example/index.ts] app mounted')
