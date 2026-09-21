# @caroundsky/lemon-admin（site-admin-plus）

站点容器组件库：为后台系统提供开箱即用的整体站点框架（导航菜单 + 多页签 + 插件体系），业务页面以 iframe 形式接入。

## 技术栈

Vue 3 + TypeScript + Vite 8（Rolldown）+ Pinia 4 + Element Plus + Sass

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

- 插件通过 `slots`（插槽组件）+ `effects`（副作用）组合扩展
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

依赖情况：

- **peerDependencies（需与宿主应用共用同一份）**：`vue@^3.5.11`、`element-plus@^2.14`
- **随包自动安装**：`lodash`
- **已打进产物，无需关心**：`pinia`、`vue-draggable-plus`、`js-cookie`、`localforage`、`mitt`、`normalize.css`

> `vue` 和 `element-plus` 都是**单例**：装成两份会导致库的组件跑在另一个实例上，`provide`/`inject` 与命名空间上下文全部失效。npm 7+ 会自动安装 peerDependencies，yarn classic 需要你手动装。
>
> `element-plus` 是库的**运行时必需依赖**，不能不用。但样式已私有化（库渲染出的是 `.lemon-*`），所以它与你自己的 Element Plus 完全隔离：你不需要引入 `element-plus/dist/index.css`，除非自己的代码也用 `el-*` 组件。

### 快速开始

```ts
// main.ts
import { createApp } from 'vue'
import App from './app.vue'
import { createLibrary } from '@caroundsky/lemon-admin'
import '@caroundsky/lemon-admin/lib/index.css'

const HOME_PAGE = 'home'

// 创建库实例（不自动创建 app，便于使用自定义根组件）
const library = createLibrary({
  config: {
    logo: {
      type: 'img',
      normal: '/logo.png', // 侧边栏展开时的 logo
      small: '/logo-sm.png', // 收起 / 水平布局时的 logo
    },
    navMenu: {
      search: true, // 菜单搜索
      popoverLevel: 2, // 弹出层级的菜单深度
      popoverColumnMaxWidth: 230, // 设置 popover 列最大宽度
      maxDepartNum: 3, // 设置最大列数
      popoverTrigger: 'click',
    },
    HOME_PAGE, // 首页菜单 id
    FIXED_DRAG: [HOME_PAGE], // 固定页签
  },
  plugins: [], // 见「插件」
})

// 容器开始初始化时注入菜单数据（库监听该事件）
library.bus.on('appCreateStart', () => {
  library.bus.emit('setMenus', menus) // menus: NavMenuItem[]
})

// 菜单设置完成后打开首页页签
library.bus.on('setMenusCompelet', () => {
  library.store.menuViewsStore().addViewById(HOME_PAGE)
})

const app = createApp(App)
library.install(app) // 同时全局注册 <SiteContainer />
app.mount('#app')
```

```vue
<!-- app.vue：根组件渲染站点容器即可 -->
<template>
  <SiteContainer />
</template>
```

### 配置项

传给 `createLibrary({ config })`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `logo.type` | `'img'` \| 其他 | 为 `'img'` 时按图片渲染，否则渲染为文本 |
| `logo.normal` | `string` | 侧边栏展开时的 logo（图片 URL 或文本） |
| `logo.small` | `string` | 收起 / 水平布局时的 logo |
| `navMenu.search` | `boolean` | 显示菜单搜索框 |
| `navMenu.defaultAside` | `boolean` | 初始是否使用侧边栏布局 |
| `navMenu.disableLayoutSwitch` | `boolean` | 禁止切换布局 |
| `navMenu.uniqueOpened` | `boolean` | 手风琴模式 |
| `navMenu.popoverLevel` | `number` | 弹出层级的菜单深度 |
| `navMenu.popoverHeightRatio` | `number` | popover 最大高度占屏幕的比例 |
| `navMenu.popoverColumnMaxWidth` | `number` | popover 列最大宽度 |
| `navMenu.maxDepartNum` | `number` | 最大列数 |
| `navMenu.popoverTrigger` | `'hover'` \| `'click'` | popover 触发方式 |
| `HOME_PAGE` | `string` | 首页菜单 id |
| `FIXED_DRAG` | `string[]` | 固定页签的菜单 id（不可拖拽、不可关闭） |

### 菜单数据格式

```ts
interface NavMenuItem {
  id: string // 菜单 ID（唯一）
  text: string // 菜单文字
  href: string // 页面地址（iframe 加载）
  icon: string // 图标：作为 class 渲染，字形由使用方自行提供
  show: boolean // 是否显示
  children?: NavMenuItem[] // 子菜单
  help?: boolean // 末级菜单是否显示帮助按钮
  helpUrl?: string // 帮助地址
  isNew?: boolean // 显示「新」标识
  isNewWindow?: boolean // 新窗口打开
}
```

> `icon` 是**纯字符串契约**，会被当作 class 直接渲染到 `<i :class="menu.icon" />`。库不内置图标字体，该 class 对应的字形需由你提供（自己的图标字体或 CSS 背景图皆可）。

### 总线（bus）

```ts
// 库发出，宿主监听
bus.on('appCreateStart', cb) // 容器开始初始化，此时注入菜单数据
bus.on('appCreateEnd', cb) // 初始化完成
bus.on('appMounted', cb) // 容器挂载完成
bus.on('setMenusCompelet', cb) // 菜单数据设置完成
bus.on('logoClick', cb) // 点击 logo
bus.on('logout', cb) // 用户点击退出登录

// 宿主发出，库监听
bus.emit('setMenus', menus) // 注入菜单数据 NavMenuItem[]

// 响应式状态（插件间共享）
bus.setState('theme', 'red')
bus.getState('theme')

// 右键菜单按钮集
bus.setContextMenu.menuItem = (view) => [
  { label: '自定义按钮', onClick: (view) => { /* ... */ } },
]
bus.setContextMenu.menuViewBar = (view) => [ /* ... */ ]
```

`bus` 也可直接 `import { bus } from '@caroundsky/lemon-admin'`，与 `effects(ctx)` 里的 `$bus` 是同一个实例。

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
    effects({ $bus, $on, $tools }) {
      $on('appCreateStart', () => {
        // 初始化逻辑：拉取用户信息、$bus.setState(...) 等
      })
    },
  }
}
```

可用插槽位：`user-dropdown`、`action-bar-addon`、`sys-dropdown`、`main-footer`、`container-slot`。

插件自己的状态用 Pinia 定义后直接引用即可，例如 `example/plugins/favMenuBar/storeModule.ts`（`useFavMenuStore()` 会解析到库创建的 Pinia 实例）。注意在 `effects` 阶段 store 尚未就绪——此时 `app.use(pinia)` 还没执行，请像示例那样在事件回调（如 `appMounted`）里首次使用。

#### 插件可用的公共 API

插件与业务组件**只能从包名导入**（`@caroundsky/lemon-admin`）。库内部的 `@/xxx`、`~/xxx` 路径是构建期别名，安装 npm 包后不可用。

| 导出 | 说明 |
| --- | --- |
| `bus` / `tools` | 事件总线与工具集（等价于 `effects(ctx)` 里的 `$bus` / `$tools`） |
| `useAppStore` / `useMenuStore` / `useMenuViewsStore` | 库的三个 Pinia store，插件共享同一实例 |
| `registerIcons` | 按需注册 Element Plus 图标 |
| `createLibrary` / `create` | 创建库实例 |
| 类型 `Plugin` / `PluginCtx` / `NavMenuItem` / `MenuView` / `ContextButton` / `SimpleMap` / `FavNavMenuItem` / `Theme` | 插件与菜单相关类型 |

库只**全局注册了自身模板用到的组件**（`ElScrollbar`、`ElAutocomplete`、`ElDropdown`、`ElDropdownMenu`、`ElDropdownItem`、`ElSwitch`、`ElPopover`、`ElIcon`，见 `src/import-element-ui.ts`）。插件模板里若要用 `el-dialog` / `el-button` / `el-input` 等其它组件，或 `Search` 之类的图标，请自行 import 或注册——这也避免打包用不到的组件代码。

库的**其它内部实现不对外暴露**——插件是自包含的，需要滚动容器、点外关闭这类能力时请自带实现（`example/` 的收藏栏与遮罩菜单就是这么做的）。

完整示例见 `example/` 目录（含用户下拉、主题切换、收藏栏、右键菜单、遮罩菜单、i18n 等插件实现），其中的插件全部按上述方式编写，可直接作为模板。
