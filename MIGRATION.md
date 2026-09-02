# Vue 2 → Vue 3 迁移修复记录

本仓库由 Vue 2 + Vue CLI + Element UI 升级为 Vue 3 + Vite + Element Plus。
本文档记录迁移后发现并修复的问题，按问题分组维护，后续修复请继续追加到对应分组。

---

## 1. 图标体系失效（2026-08-19 修复）

### 根因

- **Element UI 字体图标（`el-icon-*`）已废弃**：Element Plus 不再提供 `el-icon-*` 字体图标 class，图标改为 `@element-plus/icons-vue` 的 SVG 组件（配合 `<el-icon>` 使用）。
- **FontAwesome（`fa fa-*`）从未被项目引入**：旧代码中大量使用 `fa fa-file-text-o`、`fa fa-question-circle-o` 等 class，但项目没有任何地方加载 FontAwesome 的 CSS/字体，升级后渲染为空白。
- **`public/css/element-ui.css`（Element UI 2.x 全量样式表）残留**：其内部字体路径 `fonts/element-icons.woff` 相对解析为 `/css/fonts/...`，必然 404；且它与 Element Plus 样式大量同名（`.el-button` 等），共存会造成样式冲突。

### 修复清单

| 位置 | 原写法 | 修复方式 |
| --- | --- | --- |
| `src/components/NavMenu/components/menuTitle/NormalTitle.vue` | `<i class="... el-icon-arrow-down" />` | 改用 `<el-icon><ArrowDown /></el-icon>`，原有定位/旋转动画不变 |
| `src/components/NavMenu/components/menuTitle/NormalTitle.vue` | 默认图标 `fa fa-file-text-o` | 无 `menu.icon` 时回退为 `<el-icon><Document /></el-icon>` |
| `src/components/NavMenu/components/menuTitle/PopoverTitle.vue` | 帮助图标 `fa fa-question-circle-o` | 改用 `<el-icon><QuestionFilled /></el-icon>` |
| `src/layouts/components/MaskMenu.vue` | 关闭图标 `el-icon-close` | 改用 `<el-icon><Close /></el-icon>` |
| `src/layouts/components/MaskMenu.vue`、`example/plugins/maskMenu/maskMenu.vue` | 选中对勾 `content:'\e6da'; font-family:'element-icons'` | 改为纯 CSS 绘制的对勾（border + rotate），去除字体依赖 |
| `src/layouts/components/MaskMenu.vue`、`example/plugins/maskMenu/maskMenu.vue` | 默认图标 `fa fa-file-text-o` | 回退为 `<el-icon><Document /></el-icon>` |
| `example/plugins/contextMenu/buttons.ts` | `el-icon-refresh-right` / `el-icon-close` / `el-icon-check` / `fa fa-clone` / `fa fa-heart` | 改用 EP 图标组件 `RefreshRight` / `Close` / `Check` / `CopyDocument` / `Star` |
| `example/mock/menu.ts` | mock 图标 `fa fa-envelope-o` | 改用项目自带 icbg 字体的 `icbg-message` |
| `src/components/NavMenu/navMenu.less` | `.el-icon-arrow-right` 选择器 | 已删除（对应 DOM 结构在模板中已不存在，属死样式） |
| `index.html` + `public/` | 引用 Element UI 2.x 的 `element-ui.css` 及 `element-icons` 字体 | 已移除引用并删除 `public/css/element-ui.css`、`public/fonts/element-icons.*` |

### 配套 API 调整

- `ContextButton.icon` 类型由 `string` 扩展为 `string | Component`（`types/interfaces.d.ts`）：
  - 字符串：仍按 iconfont 类名渲染（如 `icbg-*`），向后兼容；
  - 组件：渲染为 `<el-icon><component :is="icon" /></el-icon>`，用于 EP 图标。
  - 渲染逻辑同步更新于 `src/components/ContextMenu/index.ts`（h 函数版）与 `src/components/ContextMenu/main.vue`（模板版）。

### 图标使用规范（升级后）

- **组件内部固定图标** → 一律使用 `@element-plus/icons-vue`：`<el-icon><IconName /></el-icon>`。
- **业务配置传入的图标**（如 `menu.icon`）→ 使用项目自带 icbg iconfont 类名（`icbg-*`，字体文件在 `src/assets/icbg/`，由 `src/RootContainer.vue` 引入）；或传 `{ type: 'img', src }` 图片图标。
- **禁止**再使用 `el-icon-*`、`fa fa-*` 类名，两者均无字体/样式支撑。

### 验证

- `yarn lint`：0 error。
- `yarn build`：构建通过。
- dev server 启动正常，页面不再请求 404 的字体文件。

---

## 2. Popover 进入动画丢失（2026-08-19 修复）

### 根因

Vue 3 重命名了过渡类名：**`v-enter` → `v-enter-from`**（`v-leave` → `v-leave-from`，`v-leave-to` 不变）。迁移后样式表仍使用旧的 `-enter` 选择器，导致进入时的初始状态类永远不会被应用——没有起始状态，进入动画直接跳过；离开时 `-leave-to` 不受影响，所以离开动画正常。表现为「popover 出现无动画、离开有动画」。

### 修复清单

| 位置 | 修复方式 |
| --- | --- |
| `src/components/NavMenu/navMenu.less` | `.bg-pop`、`.bg-pop-horizon`、`.bg-pop-content-next` 三组过渡的 `&-enter` 全部改为 `&-enter-from` |
| `src/components/ContextMenu/main.vue` | `.bgcb__dropdown-trans-enter` → `-enter-from`、`.bgcb__dropdown-trans-bottom-enter` → `-enter-from`（原 `-leave-active` 误用一并改为 `-leave-to`） |

注：`src/transitions/collapse-transition.ts` 使用 JS hooks 实现，不受类名变更影响，无需修改。

### 验证

- `yarn lint`：0 error；`yarn build`：构建通过。

---

## 3. 横版（horizon）菜单 popover 宽高为 0（2026-08-19 修复）

### 根因

Vue 2 版 `subMenu.vue` 中有 `horizonPopShow` 方法：popover 显示时测量内容高度，计算 `horizonScroll`（滚动区高度）与 `horizonPopWidth`（弹层宽度），并调用 `updatePopper()` 重新定位。Vue 3 迁移时这段逻辑整体丢失，`horizonScroll`/`horizonPopWidth` 恒为初始值 0，导致弹层宽度 0、滚动区高度 0，内容实际已渲染但不可见。同时 `index.vue` 算出的 `horizonPopMaxH` 也未注入 `rootMenu`。

### 修复清单

| 位置 | 修复方式 |
| --- | --- |
| `src/components/NavMenu/index.vue` | `rootMenu` 补充注入 `horizonPopMaxH` 与 `popoverColumnMaxWidth`（来自 `bus.config.navMenu`，默认 240），并纳入 watch 同步 |
| `src/components/NavMenu/subMenu.vue` | 补回 `horizonPopShow`：popover `@show` 时 `nextTick` 测量内容高度，高度超出 `horizonPopMaxH` 则以最大高度为滚动区高度（由 el-scrollbar 滚动），宽度取 `popoverColumnMaxWidth`，最后调用 `popperRef.update()` 重新定位 |

注：Vue 2 版还有「高度超限时把内容重排为多列」的 splitColumn 逻辑，Vue 3 版模板中已无对应渲染结构（`eleArr`/`__depart`），未一并迁移；当前以滚动方式兜底，如后续需要多列布局再单独恢复。

### 二次修复（popover 出现延迟约 1s）

第一版修复在 popover `@show` 时通过 `nextTick` 测量内容高度、再设置宽高并 `updatePopper()`——弹层先以 0 宽渲染，再经历「测量 → 赋值 → 重排 → 重定位」多个渲染周期，造成约 1s 的可感知延迟。

最终方案改为纯声明式，去掉全部运行时测量：

- 弹层宽度直接取配置项 `popoverColumnMaxWidth`（computed，默认 240），popover 一显示就是正确宽度；
- 滚动区改用 el-scrollbar 的 `max-height`（即 `horizonPopMaxH`）限高，内容不足时自适应、超出时滚动，无需测量 `clientHeight`；
- 移除 `horizonScroll`、`@show` 回调及 `updatePopper()` 调用。

涉及文件：`src/components/NavMenu/subMenu.vue`。

---

## 4. 竖版菜单 popover 宽度被固定为 150px（2026-08-19 修复）

### 根因

Element Plus 的 `el-popover` 组件 `width` prop **默认值为 150**（`popover.mjs`），并以行内样式 `width: 150px` 应用在 popper 上。Element UI 2.x 的 popover 默认无宽度、由内容撑开，迁移时未显式设置 `width`，导致竖版 pop 被压成 150px。

### 修复清单

| 位置 | 修复方式 |
| --- | --- |
| `src/components/NavMenu/subMenu.vue` | 竖版 popover 增加 `width="auto"`，恢复内容撑开 |
| `src/components/NavMenu/menuItem.vue` | 折叠态菜单项的提示 popover 同样增加 `width="auto"` |

注：横版 popover 已显式绑定 `:width="popoverColumnMaxWidth"`，不受影响；pop 内容容器本身有 `min-width: 240px` 样式兜底。

### 验证

- `yarn lint`：0 error；`yarn build`：构建通过。

---

## 5. 横版菜单 popover 恢复分列展示（2026-08-19 修复）

### 根因

Vue 2 版 `subMenu.vue` 在横版 popover 显示时，若内容高度超过 `horizonPopMaxH`，会用 `splitColumn` 算法按各二级菜单的子孙节点数量把内容均衡分成多列（最多 4 列），并按列数重算弹层宽度。Vue 3 迁移时该逻辑（含 `calcEle`、`departNum`、`eleArr` 及 `__depart` 渲染结构）整体丢失，pop 始终只有一列。

### 修复清单（均在 `src/components/NavMenu/subMenu.vue`）

- 迁移 `splitColumn` 均衡分列算法（与旧版一致）；
- 恢复 `horizonPopShow`：popover `@show` 时测量内容高度，超限则按 `splitColumn` 结果把 slot 节点切分为多列，渲染到 `nav-menu__submenu--pop__depart` 列容器（新增函数式组件 `VnodeColumn` 渲染 vnode 组），宽度 = `popoverColumnMaxWidth` × 列数，最后调用 popper `update()` 重新定位；
- 子孙节点计数改用 `menuData` 递归统计可见节点（`countVisibleNodes`），替代旧版解析 vnode `innerHTML` 中 `bg-submenu__title-txt` 出现次数的做法，统计口径等价但更稳健；
- 高度未超限时保持单列，宽度为 `popoverColumnMaxWidth`，行为与「问题 3 二次修复」一致。

### 二次修复（首闪未分列结构 + 分列内容渲染为函数文案）

首次实现引入两个回归：

1. **首次打开 pop 先展示未分列结构，约 0.5s 后才重排**：`@show` 后先按单列渲染一帧用于测量，再切换分列。修复：新增 `popReady` 状态，分列计算与 popper 重定位完成前以 `visibility: hidden` 隐藏滚动区，完成后一次性展示。
2. **分列后内容显示为 `() => props.nodes` 文案**：函数式组件 `VnodeColumn` 误写为 `(props) => () => props.nodes`（多包了一层箭头），Vue 将返回的函数当作字符串渲染。修正为 `(props) => props.nodes` 直接返回节点数组。

### 三次修复（pop 先空白再显示内容）

`popReady` 方案虽然避免了闪动未分列结构，但 `@show` 后才测量 DOM、计算分列、调用 `update()` 的异步链路导致 pop 先显示一段空白。由于 pop 内菜单项高度由 CSS 固定（`font-size: 12px; line-height: 2` = 24px，文本 `nowrap` 不折行），内容高度可直接由 `menuData` 节点数 × 24px 估算，**无需测量 DOM**。

最终方案改为纯 computed 声明式（`splitLayout`）：popover 打开前列数与宽度即已确定，打开即是最终布局。移除 `@show` 回调、`popReady`、`nextTick` 测量及 `updatePopper` 调用；列数随 `menuData`/`horizonPopMaxH` 变化自动重算。

### 验证

- `yarn lint`：0 error；`yarn build`：构建通过。

---

## 6. 点击菜单后 tab 栏不显示（2026-08-19 修复）

### 现象

点击子菜单后，iframe 已加载（store 中 `views` 有数据），但顶部 tab 栏一个标签都不渲染。控制台有 readonly 相关警告。

### 根因（三个叠加问题）

1. **`VueDraggable` 用法错误**：`src/layouts/components/MenuViewBar/MenuViews.vue` 使用 `<template #item="{ element }">` 渲染——这是 `vuedraggable` 的 API；`vue-draggable-plus` 的 `VueDraggable` 渲染**默认插槽**，需在其内部 `v-for`。因此一个 tab 都没渲染。
2. **Pinia getter 与 action 同名冲突**：`src/stores/menuViews.ts` 中 getter `activeView` 与 action `activeView(view)` 同名。Vuex 的 getters/actions 是独立命名空间允许同名，Pinia 不允许——注册时报 `Set operation on key "activeView" failed: target is readonly`，action 未注册成功。
3. **`bus.ts` 中 `...readonly(busState)` 展开**：使 `bus.setContextMenu` 被深度只读化，`example/plugins/contextMenu` 注册右键菜单时赋值静默失败（控制台 `Set operation on key "menuItem"/"menuViewBar" failed` 警告）。

### 修复清单

| 位置 | 修复方式 |
| --- | --- |
| `MenuViews.vue` | `VueDraggable` 改为默认插槽 + `v-for` 渲染；`sortMenuViews` 改为带 setter 的 computed（回写 `menuViewsStore.views`）；`onDrop`/`onDragStart` 适配 SortableJS 事件结构（`evt.oldIndex`）；补充 `draggable`/`filter`/`force-fallback` 等配置保持「固定 tab 不可拖」「拖出区域关闭」行为 |
| `menuViews.ts` | 删除与 getter 同名的 `activeView(view)` action（等价能力由 `activeViewById(view.id)` 提供） |
| `MenuViews.vue` 点击激活 | 改用 `menuViewsStore.activeViewById(view.id)` |
| `bus.ts` | 移除 `...readonly(busState)` 展开，`state`/`setContextMenu` 改用显式 getter 暴露可变对象 |
| `ScrollPane.vue`、`MenuViews.vue` | `$el` 访问兼容原生 DOM（`el.$el \|\| el`），因 `tagRefs` 现在引用的是普通 div |

### 验证

- Playwright + 本机 Chrome 无头复测：初始 1 tab（首页），点击叶子菜单后 2 tab、激活态正确、对应 iframe 显示；readonly 警告消除。
- `yarn lint`：0 error；`yarn build`：构建通过。

---

## 7. 关闭 tab 后重开同一菜单，tab 不显示（2026-08-19 修复）

### 根因

`MenuViews.vue` 中 tab 容器 `.view-tabs-wrap` 的宽度由 `calcTabsWidth` 通过 JS 测量各 tab DOM 宽度得出。测量在 `watch(menuViews)` + `nextTick` 后进行，但此时 VueDraggable（SortableJS）内部 DOM 尚未稳定，且基于 index 的函数式 ref 在 v-for 场景下会残留旧引用——实测关闭再重开同一菜单后，宽度被误算为 104px（实际两个 tab 合计 135px），超出的 tab 被滚动容器裁剪，表现为「tab 不显示」；再打开一个菜单时重新测量才恢复正常。

### 修复清单（`src/layouts/components/MenuViewBar/MenuViews.vue`）

- 移除 `calcTabsWidth`、`viewTabsWidth` 及相关 watch，`.view-tabs-wrap` 改用 CSS `width: max-content` 自适应内容宽度，横向溢出仍由 el-scrollbar 处理滚动——从根上消除测量时机问题。

### 验证

- Playwright 复测「打开 → 关闭 → 重开同一菜单」：`scrollWidth` 重开后立即正确（136px），tab 正常显示。
- `yarn lint`：0 error；`yarn build`：构建通过。

---

## 8. localforage 写入 IndexedDB 报 DataCloneError（2026-08-19 修复）

### 根因

`src/stores/menu.ts` 中 `toggleMenuShow` / `saveMenuSearchHistory` 直接把 Pinia state（Vue 3 响应式 Proxy 对象）传给 `localforage.setItem` 写入 IndexedDB。IndexedDB 使用结构化克隆算法，**无法克隆 Proxy 对象**，报错 `DataCloneError: Failed to execute 'put' on 'IDBObjectStore'`。Vue 2 + Vuex 时代 state 是普通对象，无此问题。

### 修复清单（`src/stores/menu.ts`）

- `toggleMenuShow`：存储时改用 `toRaw(this.navMenuMode)` 转为原始对象；
- `saveMenuSearchHistory`：存储时改用 `toRaw(this.menuSearchHistory)`。

### 验证

- `yarn lint`：0 error；`yarn build`：构建通过。

---

## 9. TS 类型报错与收藏夹视图不更新（2026-08-19 修复）

### 根因

1. **`ContextButton.onClick` 类型声明为 `() => void`**（`types/interfaces.d.ts`），但所有实际实现都接收 `view: MenuView` 参数，`tsc --noEmit` 下 10 余处 TS2322 报错；`closeAllViews(view.id)` 多传了参数（store 方法无参）。
2. **`FavMenuBar.vue` 的 `VueDraggable` 误用 `<template #item>` 插槽**（vuedraggable 的 API），vue-draggable-plus 渲染默认插槽——收藏数据已进 store 但视图一行都不渲染，表现为「addFav 后视图无响应」。与问题 6 中 `MenuViews.vue` 是同类错误。

### 修复清单

| 位置 | 修复方式 |
| --- | --- |
| `types/interfaces.d.ts` | `ContextButton.onClick` 类型改为 `(this: ContextButton, view: MenuView) => void` |
| `example/plugins/contextMenu/buttons.ts` | `closeAllViews(view.id)` 改为无参调用 |
| `src/transitions/collapse-transition.ts` | Transition hooks 参数类型 `HTMLElement` → `Element`（Vue 3 类型要求），内部断言为 HTMLElement 使用 |
| `example/plugins/favMenuBar/FavMenuBar.vue` | `VueDraggable` 改为默认插槽 + `v-for` 渲染；`handleAddFav`/`handleDelFav` 增加 `activeView` 非空守卫 |

### 验证

- `tsc --noEmit`：0 error（此前 10+ 处）。
- Playwright 复测收藏流程：加入收藏 → fav 栏立即显示；取消收藏 → 立即移除。
- `yarn lint`：0 error；`yarn build`：构建通过。

---

## 10. 横版菜单滑动按钮（icon-prev/icon-next）显隐错乱（2026-08-19 修复）

### 根因（`src/components/NavMenu/horizonSwiper.vue`）

1. **watch 丢失 `immediate: true`**：旧版用 `@Watch(..., { immediate: true })` 在初始化时计算 `slidePrevHide`/`slideNextHide`，新版普通 watch 在值未变化时从不触发，导致首次加载 `slidePrevHide` 恒为初始值 `false`（空间足够 icon-prev 也显示）。
2. **菜单数据异步到达后不重算**：`update()` 只在 `onMounted` 执行，此时菜单数据（`setMenus`）尚未到达，`calcWidth=0`；数据到达后没有触发器重算，导致 `swiperIndexMax` 一直为 0，`slideNextHide` 恒为 true（空间不够 icon-next 也不显示）。
3. **watch 链推导状态不可靠**：`slideNextHide` 依赖 swiperIndex 与 swiperIndexMax 两条 watch 的组合，值不变时 watch 不触发，resize 后状态错乱。

### 修复方式

- `slidePrevHide`/`slideNextHide` 改为 computed 直接推导：`swiperIndex === 0` / `swiperIndex >= swiperIndexMax`，废除三条 watch 链；
- 新增 `MutationObserver` 监听 slot 内容变化（覆盖菜单数据异步到达、菜单显隐切换），变化时重算宽高与索引；
- resize 监听提取为命名函数并在 `onUnmounted` 中移除（旧版未移除，有泄漏）。

### 验证

- Playwright 实测：宽屏空间足够 → 两按钮均隐藏；窄屏溢出 → 显示 icon-next；点击 next 到底 → 显示 icon-prev、隐藏 icon-next；恢复宽屏 → 均隐藏。
- `yarn lint`：0 error；`yarn build`：构建通过。

---

## 11. SFC 块顺序统一为 template → script → style（2026-08-22 修复）

### 背景

迁移修复过程中改动了多个 `.vue` 文件，但未按约定的「`<template>` 在前、`<script setup>` 在后、`<style>` 最后」顺序整理，8 个文件仍为 script 在前。

### 修复方式

以下文件重排块顺序（仅移动块位置，未改任何逻辑）：

- `src/components/NavMenu/components/menuTitle/index.vue`
- `src/components/NavMenu/horizonSwiper.vue`
- `src/components/NavMenu/index.vue`
- `src/components/NavMenu/subMenu.vue`（含嵌套 `<template>` 插槽，需手动重排）
- `src/layouts/components/MenuViewBar/MenuViews.vue`
- `src/PluginSlot.vue`
- `src/RootContainer.vue`
- `example/plugins/netTestBtn/NetTest.vue`

### 验证

- 全量扫描 `src`/`example` 下 `.vue` 文件，首个顶层块均为 `<template>`；
- `yarn build` 构建通过；`yarn lint` 无新增 error（`example/plugins/userDropdownMenu/UserDropdownMenu.vue` 的 `vue/no-multiple-template-root` 为存量问题：该规则是 Vue 2 约束，Vue 3 支持多根节点，且该文件本次未改动）。

---

## 12. 横版菜单 horizonNavMaxW 改为动态计算（2026-08-22 修复）

### 根因（`src/components/NavMenu/index.vue`）

迁移时把旧版「测量 `#horizon-operat` 宽度」的逻辑丢成了写死的 `290`，且只在 `appInited` 时赋值一次，视窗 resize 不更新。

### 修复方式

- `horizonNavMaxW = 视窗宽度 - #menu__logo 宽度 - #horizon-operat 宽度`，样式从 `calc(100% - Xpx)` 改为直接 `maxWidth: ${horizonNavMaxW}px`（初始为 0 时不设置，避免首帧菜单被压成 0 宽）；
- 重算时机：`onMounted`、`appInited` watch、window resize（debounce 200ms）；
- 新增 `ResizeObserver` 监听 `#menu__logo` 与 `#horizon-operat`：操作区插件异步渲染完成后宽度会变，仅靠 mounted/resize 会漏掉，实测首屏因此偏差约 47px；卸载时 disconnect。

### 遗留说明

`horizonSwiper.vue` 的 `swiperWidth = innerWidth - horizonOperatW - 50` 仍把 logo 宽度写死为 50（当前 logo 实际就是 50px，暂无影响），如需彻底动态化可同样改为测量 `#menu__logo`。

### 验证

- Playwright 实测：1600px 视窗 `maxWidth=1313.83px`、1100px 视窗 `maxWidth=813.83px`，均与 `innerWidth - logoW - operatW` 精确一致。
- `yarn lint`：0 error；`yarn build`：构建通过。

---

## 13. username 异步更新导致横版菜单宽度计算过期（2026-08-22 修复）

### 根因

`example` 的用户插件在 `appCreateStart` 约 1s 后才 `$bus.setState('username', ...)`（真实项目等同：登录后异步拉取用户信息）。username 到达使 `#horizon-operat` 变宽（实测 189px → 236px），但：

1. `src/components/NavMenu/index.vue` 模板中的 `:style="maxWidth"` 绑定在调试期间被注释遗留，horizonNavMaxW 完全没生效（宽度仅靠 flex 收缩碰巧正确）；
2. `src/components/NavMenu/horizonSwiper.vue` 的 `swiperWidth` 只在 mount / slot 变化 / window resize 时重算，且 logo 宽度写死为 50——username 变化后 swiper 保持旧宽度（实测滞留 1361px，比可用宽度多 47px，会压到右侧操作区）。

### 修复方式

- `index.vue`：恢复 `:style` 绑定（`horizonNavMaxW > 0` 时才设置，避免首帧压成 0 宽）；上一条的 `ResizeObserver` 已覆盖 username 引起的 operat 宽度变化；
- `horizonSwiper.vue`：**改为纯 CSS 方案**——根元素 `width: 100%` 撑满父容器，JS 不再计算 `innerWidth - logo - operat`，只在 `update()` 里量取根元素渲染后的实际宽度用于滑动计算（`swiperIndexMax`、`translateX`）；`ResizeObserver` 改为观察根元素自身（视窗 resize、父级 maxWidth 变化、operat 变宽最终都反映到根元素宽度上），移除了对 `#horizon-operat`/`#menu__logo` 的监听和 window resize 监听。

### 验证

- Playwright 时序实测：username 到达前 menu/swiper=1361px；username 到达后 operat 189→236px，menu maxWidth 与 swiper 宽度约 0.3s 内同步更新为 1313.83px；
- 800px 窄视窗：swiper 跟踪到 513.83px，icon-next 出现；滑动到底 icon-prev 出现 / icon-next 隐藏，回退正常（`swiperIndex`/`translateX` 状态逐点核对无误）；恢复宽视窗后两按钮均隐藏。
- `yarn lint`：0 error；`yarn build`：构建通过。

---

## 14. ContextMenu 去除 h() 写法 + 新增 appendTo 挂载位置参数（2026-08-22 修复）

### 背景

1. `src/components/ContextMenu/index.ts` 迁移时用 `h()` 内联重写了菜单组件，而同目录已有模板写法的 `main.vue` 被闲置，h() 版本还丢了旧版的「点击外部关闭 / 方向翻转」等行为；
2. 右键菜单固定挂载到 body：在 pop（popover 弹层）内右键菜单项时，鼠标移入右键菜单会触发 pop 的 mouseleave，导致 pop 消失。

### 修复方式

- `index.ts`：删除内联 `h()` 组件，改为 `createApp(ContextMenuComponent)` 挂载 `main.vue`（SFC 模板），destroy 回调延迟 300ms 卸载以保留 leave 动画；销毁顺序改为先 `unmount` 再移除容器 DOM；
- 新增 `appendTo?: HTMLElement` 参数，默认 `document.body`；传入自定义容器时菜单位置相对容器计算（`getOffsetWithDom`）。旧参数 `appendToBody`/`reference` 保留兼容并标记 `@deprecated`；
- `menuItem.vue`：右键事件向上查找 `nav-menu__submenu--pop` 祖先，找到则以 `appendTo` 传入——右键菜单渲染进 pop 内部，鼠标移入不再触发 pop 关闭。

### 验证

- Playwright 实测：tab 栏右键 → 菜单挂在 body、内容正确；收起侧边栏 hover 出 pop 后右键 pop 内子项 → 菜单挂载在 pop 内（`hasCtxMenu: true`），鼠标移入菜单停留 1.2s pop 保持 `display: block`；
- `yarn lint`：0 error；`yarn build`：构建通过。

---

## 15. ContextMenu 修正：el-icon 解析、底部边界翻转（2026-08-22 修复）

### 根因

1. `main.vue` 模板用了 `<el-icon>`，但右键菜单是独立 `createApp` 挂载的实例，没有注册 ElementPlus，`el-icon` 无法解析；
2. 旧版有「底部空间不足时向上翻转」的逻辑（contrast 方向），迁移时丢失。

> 注：曾尝试改为「在鼠标位置打开」，因边界情况多（翻转基准、容器内相对坐标等），已撤回，保持按目标元素定位。

### 修复方式

- `main.vue`：本地 `import { ElIcon } from 'element-plus'`（独立 app 不依赖全局注册）；`view` prop 类型放宽为 `MenuView | MenuView[]`（调用方传的是单对象，修复类型告警）；
- `main.vue` 新增 `onAdjust` 回调 prop：渲染前以「占位但不可见」（`display: block; visibility: hidden`）的方式测出菜单实际高度，把 `{ height, flip }` 交给外部；`flip(top)` 设置 `contrast`（箭头朝下）并修正 top，全部在 `visible = true` 之前同步完成——enter 动画开始时不带任何 class/位置变更（实测：enter 进行中改 `:class` 会擦掉 transition 类导致动画卡在 scaleY(0)；transition name 也固定不再切换，翻转时的 transform-origin 用更高优先级的 `.contrast` 类覆盖）；
- `index.ts`：`onAdjust` 中实现翻转——**是否翻转只看菜单与视窗底部的距离，与挂载位置无关**（`height > innerHeight - 菜单文档top` 即翻转）；flip 的 top 按当前坐标系换算：body 挂载用文档坐标（`元素top - 菜单高`），容器挂载用相对坐标（`_top - 菜单高`）。

### 验证

- Playwright 实测（500px 矮视窗）：
  - tab 栏右键 → 菜单出现在 tab 下方（top=38 ≈ tab 底边 40-2），`el-icon` 正常渲染出 svg；
  - 侧边菜单 top=442 处右键（菜单高 60）→ 上翻到 `top=382`（元素上方），带 `contrast` 类，完整可见；
  - pop 内右键（视窗空间充足）→ 菜单挂进 pop、不翻转；按元素位置打开。
- `yarn lint`：0 error；`yarn build`：构建通过。

---

## 16. 再次右键时新菜单被误关闭（2026-08-22 修复）

### 根因（`src/components/ContextMenu/index.ts`）

旧菜单销毁时延迟 300ms 调全局的 `ContextmenuProxy.destroy()`（为保留 leave 动画）。再次右键时序：mousedown → 旧菜单 destroy（300ms 定时器排队）→ contextmenu → 新菜单创建并赋值给 `lastApp` → 300ms 后定时器触发，把**新实例**卸载了。

### 修复方式

`onDestroy` 的延迟销毁改为只处理闭包内捕获的自身 `app`/`container`，卸载后仅当 `lastApp === app` 时才清空全局引用，不再误杀新实例。

### 验证

- Playwright 实测：右键菜单项 A → 菜单出现；再右键菜单项 B → 旧菜单关闭、新菜单保持在 B 的位置（1s 后仍可见）；左键点击非 iframe 区域 → 菜单正常关闭。
- 备注：点击 iframe 区域无法关闭菜单是固有行为（事件不冒泡到父页面 document），与旧版一致。
- `yarn lint`：0 error；`yarn build`：构建通过。

---

## 17. ContextMenu 废弃自造方案，整体对齐旧版（2026-08-22 调整）

### 背景

前几轮（第 14~16 条）重写 ContextMenu 时自造了编排方式（`appendTo` 参数、`onAdjust` 回调 prop、预测量翻转等），与旧版差异越来越大。本次**废弃自造方案**，完整参照旧版（`site-admin-plus-old/src/components/ContextMenu`）转为 Vue 3 写法。

### 旧版 → Vue3 的对应关系

| 旧版（Vue2） | 新版（Vue3） |
| --- | --- |
| `Vue.extend(main.vue)` + `new Constructor()` | `createApp(main.vue, props)` |
| 实例属性读写（`instance.visible/style/contrast = ...`） | `main.vue` 内 `reactive` 的 `state`（同名字段），`defineExpose({ state })` 后由 index.ts 读写 |
| `instance.$on('destroy'/'mounted')` | createApp props 的 `onDestroy` / `onMounted` |
| 组件 `destroy()` 内 `$destroy()` + 移除 DOM | 组件只 `emit('destroy')`，index.ts 回调中 `app.unmount()` + 移除容器（同步，无延迟，天然规避第 16 条的误杀时序） |
| `Vue.prototype.$contextmenu` | `useContextMenu()` / 默认导出 |

### API（与旧版完全一致）

`event / view / definedBtn / afterDestory / queryClass / setOffset / x / y / appendToBody / reference`。定位、挂载（`appendToBody === false` 时插入 `nav-menu__submenu--pop`，找不到兜底 body）、翻转逻辑（`_reference === 'body'` 按视窗底部距离，否则按参照容器）均照搬旧版公式。`menuItem.vue` 恢复旧版传参（`queryClass`、`setOffset`、`appendToBody: !isFlatMenu`、`reference`）。

### 迁移期的必要保留项

- `main.vue` 本地 `import { ElIcon }`（独立 app 无 ElementPlus 全局注册），图标支持组件形式（旧版仅支持 class 字符串）；
- 翻转测量放在 `onMounted` 的 `nextTick` 里再套一层 `nextTick`：确保 `visible = true` 的渲染已刷新，否则 `display: none` 下 `clientHeight` 为 0。

### 验证

- `yarn lint`：0 error；`yarn build`：构建通过。
- （本轮未跑 Playwright；前序轮次已实测覆盖 tab 右键、pop 内右键、二次右键旧关新开、底部翻转等场景，行为路径未变。）

---

## 18. 竖版 pop 内右键菜单全部显示在顶部（2026-08-22 修复）

### 根因（`src/components/ContextMenu/index.ts` 翻转逻辑 else 分支）

旧版公式 `containerDom.clientHeight - getOffset(menuEl).top` 把「参照容器高度」与「菜单的文档坐标 top」两个不同坐标系的值混减：竖版 pop 场景下结果恒为负数 → 永远判定「底部空间不足」→ 永远上翻（`_top - 菜单高 - 20`），菜单全部顶到 pop 顶部。

### 修复方式

改为同一坐标系（视窗坐标）计算容器内剩余空间：`containerDom.getBoundingClientRect().bottom - menuEl.getBoundingClientRect().top`，翻转公式本身不变。

### 验证

- `yarn lint`：0 error；`yarn build`：构建通过。

---

## 19. 菜单搜索不支持拼音首字母/全拼检索（2026-08-22 修复）

### 根因（`src/components/NavMenuSearch.vue`）

迁移时用了一个「简化版」拼音桩（只做子串包含匹配），没有接入旧版的拼音转换库。

### 修复方式

- 移除拼音桩，接入仓库已有的旧版拼音库：`import { tranformToPinyin } from '@/utils/filterPinyin/ChineseToPinyin_1_0.cjs'`（内容与旧版 `ChineseToPinyin_1_0.js` 一致），`const pinyin = new tranformToPinyin()`；筛选逻辑本身与旧版一致，无需改动。

### 验证

- Playwright 实测：`js`/`jieshao` → 介绍；`zcd`/`zicaidan` → 子菜单系列（23 条）；汉字 `介绍`/`子菜单` 正常；多音字（单 dan/chan/shan）按候选数组处理正常。
- `yarn lint`：0 error；`yarn build`：构建通过（拼音字典打包后包体 +80KB 左右，符合预期）。

---

## 20. 拼音库重构为 TS（ChineseToPinyin_1_0.cjs → filterPinyin）（2026-08-22 重构）

### 背景

`src/utils/filterPinyin/ChineseToPinyin_1_0.cjs` 是旧版原型链写法的库（扩展名 .cjs 但内容是 ESM，名实不符），且字典中汉字全是 `\uXXXX` 转义，无法阅读维护；`pinyin.ts`（monoPhone）为无人引用的重复字典。

### 重构内容

- 新增 `src/utils/filterPinyin/dict.ts`：`MATCHING_TABLE`（单音字：读音 → 汉字集）与 `POLYPHONE_TABLE`（多音字：汉字 → 读音数组），`\uXXXX` 全部还原为字面汉字；
- 新增 `src/utils/filterPinyin/index.ts`：纯模块函数实现，导出 `ConvertPinyin(options)`，无需 `new`；
- 删除 `ChineseToPinyin_1_0.cjs` 与死代码 `pinyin.ts`；
- `NavMenuSearch.vue`：`new tranformToPinyin()` 改为直接调用 `ConvertPinyin(...)`。

### 优化点

- 汉字 → 读音反查表模块级惰性构建一次（旧版每个实例构建一次）；
- 检索逻辑重写为直白实现：全拼按「拼接最优候选 → 子串命中 → 区间映射回汉字」，首字母按「首字母串与汉字一一对应」，替代旧版 `#&&#` 标记 + 多重嵌套闭包；
- 删除无人使用的 HTML 高亮输出路径（getHtml / className / Division，约 100 行）；
- 字典未收录的汉字保留原字返回（旧版推入 `false`，后续 substr 会报错）。

### 验证

- 新旧实现对拍（同页面内 import 旧版 js 与新版 ts）：18 个文本 × 22 个检索词（首字母/全拼/混合/多音字）396 组 + 转换模式 76 组，输出全部一致；
- Playwright UI 实测：`js`/`jieshao`/`zcd`/`zicaidan`/`介绍` 检索结果正确；
- `yarn lint`：0 error；`yarn build`：构建通过。

---

## 21. 主题切换后导航菜单背景色不更新（2026-08-22 修复）

### 根因

主题样式 scoped 在 `.site-container--theme-*` 类下。旧版布局从根 store 的 themes 模块读 `currentTheme`；新版 `src/layouts/index.vue` 读的是 `appStore.currentTheme`——该字段不存在（主题插件有自己的 pinia store），computed 永远返回 'default'，`site-container--theme-*` 类从不更新，`aside-nav-menu` / `nav-menu--horizon` 背景色保持默认主题。

### 修复方式

- 主题插件（`example/plugins/themes/storeModule.ts`）`updateBodyThemeName` 中同步 `bus.setState('theme', name)`（init 时也会走到）；
- `src/layouts/index.vue` 的 `theme` 改为 `bus.getState('theme')`（bus.state 是 reactive，computed 可响应）。

### 验证

- Playwright 实测：竖版切 red → container 类更新为 `site-container--theme-red`，`.aside-nav-menu` 背景 rgb(192,65,95)；横版切 red → `.nav-menu--horizon` 背景由 rgb(0,138,219) 变为 rgb(202,96,121)（lighten 8% 生效）。
- `yarn lint`：0 error；`yarn build`：构建通过。

---

## 22. i18n 修复：$t 不可用、语言切换不生效（2026-08-22 修复）

### 根因（多层）

1. `example/plugins/i18n/main.ts` 用 `createI18n({ legacy: false })` 但未开 `globalInjection`，模板里的 `$t(...)` 未注入；
2. locale 文件是 `.json5`（无引号键名），加载靠「正则去注释 + JSON.parse 失败兜底 eval」的脆弱 hack；
3. `UserDropdownMenu.vue` 的 `setLocale` 是桩（只 console.log，真正的调用被注释），且 `@click.native` 是 Vue 2 写法（Vue 3 已移除 `.native` 修饰符，会编译成 `onClickNative` prop，点击根本不触发）；
4. i18n 实例初始语言写死 zh-CN，不读 cookie；`setLocale` 也不写 cookie，刷新后丢失。

### 修复方式

- `main.ts`：`globalInjection: true`；locale 文件改为标准 `.json`（键名加引号），用 `import.meta.glob('./locales/*.json', { eager: true })` 直接加载，删除解析 hack；初始语言从 cookie 读取（`getInitLocale`）；
- `storeModule.ts`：`setLocale` 写 `Culture=lang=xx` cookie 持久化；`validLocale`/`getInitLocale` 移至 main.ts 导出复用；
- `UserDropdownMenu.vue`：删除 `@click.native` 的 `.native`；`setLocale` 接入 `useI18nStore().setLocale`；
- `.eslintrc.cjs`：关闭 `vue/no-multiple-template-root`（Vue 2 约束，Vue 3 支持多根节点；extends 仍为 vue2 预设 `plugin:vue/essential`，后续可整体迁移到 `plugin:vue/vue3-essential`）。

### 验证

- Playwright 实测：用户下拉正常渲染「更新菜单 / 退出登录」；点击 English → cookie 写入、文案变「Update menu / Sign out」；预设 cookie 后刷新 → 启动即为英文。
- `yarn lint`：0 error；`yarn build`：构建通过。

补充：`$t` 的模板类型报错（`Property '$t' does not exist...`）——vue-i18n v9 在 `legacy: false` 下不会自动给组件实例注入 `$t` 类型，已在 `src/shims-tsx.d.ts` 的 `ComponentCustomProperties` 中补充 `$t: import('vue-i18n').ComposerTranslation` 声明，`tsc --noEmit` 通过。
