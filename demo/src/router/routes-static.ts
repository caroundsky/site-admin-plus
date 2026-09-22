import { RouteRecordRaw } from 'vue-router'

const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/401',
    name: '401',
    meta: { noAuthRequired: true },
    component: () => import('@/views/ErrorPage'),
    props: { errType: '401' },
  },
  {
    path: '/403',
    name: '403',
    meta: { noAuthRequired: true },
    component: () => import('@/views/ErrorPage'),
    props: { errType: '403' },
  },
  {
    path: '/404',
    name: '404',
    meta: { noAuthRequired: true },
    component: () => import('@/views/ErrorPage'),
    props: { errType: '404' },
  },
]

export default staticRoutes
