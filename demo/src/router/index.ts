import { createRouter, createWebHashHistory } from 'vue-router'

import NProgress from 'nprogress'
import { authStore } from '@/stores/auth'

import routes from './routes'

import appConfig from '@/app.config'

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return {
        top: 0,
        left: 0,
      }
    }
  },
})

router.beforeEach(async (routeTo, routeFrom, next) => {
  if (appConfig.routerLoading) {
    // 直接进入的第一个页面不显示路由切换的进度条
    if (routeFrom.name) {
      NProgress.start()
    }
  }

  // 默认所有页面__都需要__进行登录状态判断，
  // 如果有部分路由不需要登录即可查看（如分享类页面），
  // 可设置路由配置的 meta.noAuthRequired 为 `true`
  const noAuthRequired = routeTo.matched.some((route) => route.meta.noAuthRequired)

  // 不需登录判断的页面直接进入
  if (noAuthRequired) return next()

  // 演示用：登录态来自前端模拟（localStorage），未登录一律去登录页
  const authInfo = authStore()

  if (authInfo.loggedIn) {
    return next()
  }

  return next({ name: 'login' })
})

router.afterEach(() => {
  if (appConfig.routerLoading) {
    NProgress.done()
  }
})

export default router
