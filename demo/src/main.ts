/**
 * Element-plus 通过`unplugin-element-plus/vite`和`unplugin-vue-components/vite`
 * 实现自动按需引入，因此无需在入口文件手动引入
 */

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

// 自定义nprogress样式
import '@/utils/nprogress'
// 站点容器样式（库内的 Element Plus 样式已私有化为 lemon- 前缀）
import '@caroundsky/lemon-admin/lib/index.css'
import router from './router'
import dialogService from '@caroundsky/el-plus-dialog-service'

import { library } from './site'
import App from './App.vue'

// 站点容器内部用了 `$t`（见库的 AppActionBar），需要宿主安装 vue-i18n 并注入全局 $t。
// 这里只放容器用到的那条文案，其余键缺失时回退为键名本身。
const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'zh-CN',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    'zh-CN': { 退出登录: '退出登录' },
    'en-US': { 退出登录: 'Sign out' },
  },
})

const app = createApp(App)

// 必须先安装站点容器，再 app.use(router)。
//
// vue-router 在 install 时就会启动首次导航，而路由守卫里要用 authStore()——
// 它需要 activePinia。安装站点容器会 app.use(pinia) 从而激活 Pinia，
// 顺序反了守卫就会抛 `getActivePinia() was called but there was no active Pinia`。
//
// 另外不要在本文件再 `app.use(createPinia())`：createLibrary 内部已创建 Pinia，
// 两个都装会让「谁生效」取决于调用顺序。
library.install(app)

app.use(router)
app.use(i18n)

app.config.globalProperties.$dialogService = dialogService

app.mount('#app')
