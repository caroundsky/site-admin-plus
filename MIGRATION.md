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
