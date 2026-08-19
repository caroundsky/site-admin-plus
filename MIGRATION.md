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
| `src/layouts/components/MaskMenu.vue` | 选中对勾 `content:'\e6da'; font-family:'element-icons'` | 改为纯 CSS 绘制的对勾（border + rotate），去除字体依赖 |
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

### 验证

- `yarn lint`：0 error；`yarn build`：构建通过。
