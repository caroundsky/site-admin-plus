/**
 * 模拟菜单数据（演示用，无后端参与）
 *
 * href 指向 demo/public/pages 下的本地静态页——离线可用，
 * 也不会像外链那样被目标站点的 X-Frame-Options 拦截。
 */
import type { NavMenuItem } from '@caroundsky/lemon-admin'

/** 默认打开的首页菜单 id */
export const HOME_PAGE = 'dashboard'

const page = (name: string) => `${import.meta.env.BASE_URL}pages/${name}.html`

const menus: NavMenuItem[] = [
  {
    id: HOME_PAGE,
    text: '数据看板',
    href: page('dashboard'),
    icon: '',
    show: true,
  },
  {
    id: 'trade',
    text: '交易管理',
    href: '',
    icon: '',
    show: true,
    children: [
      {
        id: 'orders',
        text: '订单管理',
        href: page('orders'),
        icon: '',
        show: true,
        isNew: true,
      },
      {
        id: 'refunds',
        text: '退款单',
        href: page('orders'),
        icon: '',
        show: true,
      },
      {
        id: 'shipments',
        text: '发货单',
        href: page('orders'),
        icon: '',
        show: true,
        isNewWindow: true,
      },
    ],
  },
  {
    id: 'reports',
    text: '报表中心',
    href: page('reports'),
    icon: '',
    show: true,
    help: true,
    helpUrl: 'https://element-plus.org/zh-CN/',
  },
  {
    id: 'system',
    text: '系统设置',
    href: '',
    icon: '',
    show: true,
    children: [
      {
        id: 'basic',
        text: '基础配置',
        href: page('settings'),
        icon: '',
        show: true,
      },
      {
        id: 'users',
        text: '用户权限',
        href: page('users'),
        icon: '',
        show: true,
      },
    ],
  },
  {
    // 演示 show: false —— 该菜单及其子菜单不会出现在导航里
    id: 'internal',
    text: '内部菜单（不展示）',
    href: page('settings'),
    icon: '',
    show: false,
  },
]

export default menus
