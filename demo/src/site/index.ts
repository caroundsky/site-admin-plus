/**
 * 站点容器实例
 *
 * 通过 npm 依赖使用 @caroundsky/lemon-admin：
 *  - 这里创建库实例（不自动创建 app，由 main.ts 装到宿主应用上）
 *  - 菜单数据由宿主通过 bus 注入，容器在挂载时会 emit `appCreateStart`
 */
import { createLibrary } from '@caroundsky/lemon-admin'
import menus, { HOME_PAGE } from '@/mock/menu'
import userMenuPlugin from './plugin-user'

export const library = createLibrary({
  config: {
    logo: {
      type: 'text',
      normal: '站点容器 Demo',
      small: 'SC',
    },
    navMenu: {
      search: true,
      popoverLevel: 2,
      popoverColumnMaxWidth: 230,
      maxDepartNum: 3,
      popoverTrigger: 'click',
      defaultAside: true,
    },
    HOME_PAGE,
    FIXED_DRAG: [HOME_PAGE],
  },
  plugins: [userMenuPlugin()],
})

// 容器开始初始化时注入菜单数据
library.bus.on('appCreateStart', () => {
  library.bus.emit('setMenus', menus)
})

// 菜单就绪后打开首页页签
library.bus.on('setMenusCompelet', () => {
  library.store.menuViewsStore().addViewById(HOME_PAGE)
})
