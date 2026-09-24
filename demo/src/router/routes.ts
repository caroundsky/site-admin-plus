import { RouteRecordRaw } from 'vue-router'
import staticRoutes from './routes-static'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    meta: {
      noAuthRequired: true,
    },
    component: () => import('@/views/login.vue'),
  },
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home.vue'),
  },
  {
    path: '/demo',
    name: 'demo',
    component: () => import('@/views/demo.vue'),
  },
  {
    // 站点容器的「路由打开页」菜单项指向这里（见 src/mock/menu.ts），
    // 容器会用 iframe 加载它——与 public/pages/*.html 的静态页形成对照
    path: '/embed',
    name: 'embed',
    component: () => import('@/views/embed/index.vue'),
  },
]

export default [
  ...routes,
  ...staticRoutes,
  {
    path: '/:catchAll(.*)',
    redirect: { name: '404' },
  },
]
