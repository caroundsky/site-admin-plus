# @caroundsky/lemon-admin（site-admin-plus）

站点容器组件库：为后台系统提供开箱即用的整体站点框架（导航菜单 + 多页签 + 插件体系），业务页面以 iframe 形式接入。

## 技术栈

Vue 3 + TypeScript + Vite 8（Rolldown）+ Pinia 4 + Element Plus + Less

## 功能点

### 导航菜单

- 垂直（侧边栏）/ 水平（顶部）两种布局，运行时可切换
- 菜单数据驱动，支持任意层级嵌套
- 收起状态下以 popover 弹出子菜单；水平模式下溢出项支持左右滑动（horizonSwiper）
- 菜单项支持图标、`isNew` 标识、帮助按钮（`help`/`helpUrl`）、`show` 控制显隐
- 菜单搜索：支持中文、拼音全拼、拼音首字母缩写检索，带搜索历史

### 菜单页签（MenuViewBar）

- 点击菜单打开页签，页面以 iframe 承载（多页签共存、切页不刷新）
- 页签拖拽排序、关闭、关闭其他、关闭所有
- 页签右键菜单：刷新 / 关闭 / 关闭其他 / 关闭所有 / 新窗口打开 / 设为常用
- 固定页签（`FIXED_DRAG`）不可拖拽、不可关闭

### 右键菜单（ContextMenu）

- 菜单项、页签均可右键唤起，按钮集可由外部通过 `bus.setContextMenu` 完全自定义
- 支持自定义挂载位置（`appendToBody: false` 时可挂进 popover 内部）
- 底部空间不足自动向上翻转

### 常用菜单（收藏）

- 菜单项/页签可设为常用，底部收藏栏快速打开
- 支持设为默认打开、默认首页

### 主题

- 内置多套主题（纯色 + 渐变色），运行时切换，即刻生效

### 插件体系

- 插件通过 `slots`（插槽组件）+ `effects`（副作用）+ `storeModule`（Pinia store）组合扩展
- 内置插槽位：`user-dropdown`（用户下拉）、`action-bar-addon`（操作栏追加）、`sys-dropdown`（设置下拉）、`main-footer`（主区域底部）、`container-slot`（容器级）
- 插件间通过 bus（事件 + 响应式 state + config）通信

### 其他

- i18n（vue-i18n，模板可直接使用 `$t`，语言 cookie 持久化）
- 系统配置本地持久化（localforage）
- 遮罩菜单（MaskMenu）、应用初始化加载页
- 全量 TS 类型检查（`yarn type-check`）

## 使用方式

### 安装

```bash
yarn add @caroundsky/lemon-admin
```

对等依赖（需自行安装）：`vue@^3.5.11`、`pinia@^4`、`element-plus`、`vue-draggable-plus`

### 快速开始

```ts
// main.ts
import { createApp } from 'vue'
import App from './app.vue'
import { createLibrary } from '@caroundsky/lemon-admin'
import '@caroundsky/lemon-admin/lib/index.css'

const library = createLibrary({
  config: {
    logo: {
      type: 'img',
      normal: '/logo.png', // 侧边栏展开时的 logo
      small: '/logo-sm.png', // 收起/水平布局时的 logo
    },
    navMenu: {
      search: true, // 菜单搜索
      popoverLevel: 2, // 弹出层级的菜单深度
      uniqueOpened: true, // 手风琴模式
    },
    HOME_PAGE: 'home', // 首页菜单 id
    FIXED_DRAG: ['home'], // 固定页签
  },
  plugins: [], // 见「插件」
})

// 监听总线事件并注入菜单数据
library.bus.on('appCreateStart', () => {
  library.bus.emit('setMenus', menus) // menus: NavMenuItem[]
})

const app = createApp(App)
library.install(app)
app.mount('#app')
```

### 菜单数据格式

```ts
interface NavMenuItem {
  id: string // 菜单 ID（唯一）
  text: string // 菜单文字
  href: string // 页面地址（iframe 加载）
  icon: string // 图标
  show: boolean // 是否显示
  children?: NavMenuItem[] // 子菜单
  help?: boolean // 末级菜单是否显示帮助按钮
  helpUrl?: string // 帮助地址
  isNew?: boolean // 显示「新」标识
  isNewWindow?: boolean // 新窗口打开
}
```

### 总线（bus）

```ts
// 事件
bus.emit('setMenus', menus) // 设置菜单数据
bus.on('setMenusCompelet', cb) // 菜单设置完成
bus.on('logout', cb) // 用户点击退出登录
bus.on('logoClick', cb) // 点击 logo

// 响应式状态（插件间共享）
bus.setState('theme', 'red')
bus.getState('theme')

// 右键菜单按钮集
bus.setContextMenu.menuItem = (view) => [
  { label: '自定义按钮', onClick: (view) => { /* ... */ } },
]
```

### 插件

```ts
import type { Plugin } from '@caroundsky/lemon-admin'
import MyDropdown from './MyDropdown.vue'

export default function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    slots: {
      'user-dropdown': MyDropdown, // 挂载到用户下拉插槽
    },
    effects({ $bus, $on, $emit, $tools }) {
      $on('appCreateStart', () => {
        // 初始化逻辑：拉取用户信息、$bus.setState(...) 等
      })
    },
  }
}
```

可用插槽位：`user-dropdown`、`action-bar-addon`、`sys-dropdown`、`main-footer`、`container-slot`。

完整示例见 `example/` 目录（含用户下拉、主题切换、收藏栏、右键菜单、遮罩菜单、i18n 等插件实现）。

## 开发

```bash
yarn          # 安装依赖
yarn serve    # 启动示例（example/）
yarn build    # 构建库产物到 lib/
yarn lint     # eslint 检查并自动修复
yarn type-check  # vue-tsc 全量类型检查
```

## 迁移记录

Vue 2 + vue-cli → Vue 3 + Vite 的迁移过程与问题修复记录见 [MIGRATION.md](./MIGRATION.md)。
