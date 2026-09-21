/**
 * Element Plus 组件按需引入 + 私有命名空间（lemon-）
 * Vue 3 版本
 *
 * 命名空间的两端必须一致，缺一不可：
 *  - 编译期：src/styles/element-theme.scss 里的 $namespace
 *  - 运行期：本文件 setupElementPlus() 中的 provideGlobalConfig
 */
import type { App, AppContext, Component } from 'vue'
import { computed } from 'vue'

// Element Plus 组件
// 仅保留库自身模板中用到的，以及服务式组件（见下方 setupElementPlus）
import {
  ElScrollbar,
  ElAutocomplete,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElSwitch,
  ElPopover,
  ElIcon,
  ElLoading,
  ElMessage,
  ElMessageBox,
  ElNotification,
  configProviderContextKey,
  namespaceContextKey,
  provideGlobalConfig,
} from 'element-plus'

// Element Plus 样式（按需 + 私有前缀，见该文件顶部说明）
import '@/styles/element-theme.scss'

// Element Plus 图标（按需：全量注册会让打包器无法 tree-shaking，
// 293 个图标会全部进入产物，见 README 的图标注册说明）
import {
  ArrowDown,
  Close,
  Document,
  QuestionFilled,
  Setting,
} from '@element-plus/icons-vue'

/** 私有命名空间，必须与 src/styles/element-theme.scss 的 $namespace 保持一致 */
export const ELEMENT_NAMESPACE = 'lemon'

/**
 * 预注册的常用图标：库内各 SFC 均已显式 import，这里同时全局注册一份，
 * 供消费方插件模板直接使用（其余图标请用 registerIcons 按需注册）。
 */
const BUILTIN_ICONS = {
  ArrowDown,
  Close,
  Document,
  QuestionFilled,
  Setting,
}

/**
 * 按需注册 Element Plus 图标组件。
 *
 * 消费方若在自己的插件模板里直接使用其它图标（如 <Search />），需自行注册：
 * ```ts
 * import { Search } from '@element-plus/icons-vue'
 * import { registerIcons } from '@caroundsky/lemon-admin'
 *
 * registerIcons(app, { Search })
 * ```
 * 图标为 ESM 具名导出且 sideEffects: false，按需引入可被正常 tree-shaking。
 */
export function registerIcons(app: App, icons: Record<string, Component>): App {
  Object.entries(icons).forEach(([name, component]) => {
    app.component(name, component)
  })
  return app
}

/**
 * 为服务式组件构造 AppContext。
 *
 * message / message-box / notification / loading 这四类是通过
 * `render(vnode, container)` 脱离组件树渲染的，拿不到组件树上的 provide，
 * 只能通过模块级单例的 `_context`（或调用时显式传入的第 2 个参数）取得上下文。
 * 若上下文为空，Vue 会退化成 emptyAppContext —— namespace 丢失，且
 * ElMessageBox 模板里的 el-button / el-overlay / el-focus-trap 全部解析失败。
 */
function createServiceContext(app: App): AppContext {
  const host = app._context
  const provides: Record<PropertyKey, unknown> = Object.create(host.provides)

  provides[namespaceContextKey] = computed(() => ELEMENT_NAMESPACE)
  provides[configProviderContextKey] = computed(() => ({
    ...(((
      host.provides[configProviderContextKey] as { value?: object } | undefined
    )?.value ?? {}) as object),
    namespace: ELEMENT_NAMESPACE,
  }))

  // 原型指向宿主 app 的 context，从而继承其全局组件与 globalProperties
  return Object.assign(Object.create(host), { provides }) as AppContext
}

/**
 * 把服务式组件单例的 `_context` 指向本库的上下文。
 * 仅在消费方尚未接管时绑定，避免覆盖消费方自己的 Element Plus 配置
 * （消费方若先执行 app.use(ElementPlus)，其 _context 已存在，此处不动）。
 */
function bindServiceContext(ctx: AppContext) {
  const singletons = [
    ElMessage,
    ElNotification,
    ElMessageBox,
    ElLoading.service,
    ElLoading.directive,
  ] as unknown as Array<{ _context?: AppContext | null }>

  for (const service of singletons) {
    if (!service._context) {
      service._context = ctx
    }
  }
}

/**
 * 安装 Element Plus 组件到 Vue 应用
 */
export function setupElementPlus(app: App) {
  // 注册组件（库自身模板中实际用到的；其余由使用方按需自行注册）
  const components = [
    { name: 'ElScrollbar', component: ElScrollbar },
    { name: 'ElAutocomplete', component: ElAutocomplete },
    { name: 'ElDropdown', component: ElDropdown },
    { name: 'ElDropdownMenu', component: ElDropdownMenu },
    { name: 'ElDropdownItem', component: ElDropdownItem },
    { name: 'ElSwitch', component: ElSwitch },
    { name: 'ElPopover', component: ElPopover },
    { name: 'ElIcon', component: ElIcon },
  ]

  components.forEach(({ name, component }) => {
    app.component(name, component)
  })

  // 注册图标组件（仅库自身用到的，其余由消费方按需调用 registerIcons）
  registerIcons(app, BUILTIN_ICONS)

  // 私有命名空间：提供到 app 层，覆盖整棵组件树（含消费方自己的根组件）
  // 注意不要传第 3 个参数 global=true —— 那会无条件覆盖模块级 globalConfig，
  // 清掉消费方已有的 Element Plus 配置；服务式组件已由 _context 拿到命名空间。
  provideGlobalConfig({ namespace: ELEMENT_NAMESPACE }, app)
  bindServiceContext(createServiceContext(app))

  // 注册 Loading 指令
  app.directive('loading', ElLoading.directive)

  // 全局配置
  app.config.globalProperties.$message = ElMessage
  app.config.globalProperties.$msgbox = ElMessageBox
  app.config.globalProperties.$alert = ElMessageBox.alert
  app.config.globalProperties.$confirm = ElMessageBox.confirm
  app.config.globalProperties.$prompt = ElMessageBox.prompt
  app.config.globalProperties.$notify = ElNotification
  app.config.globalProperties.$loading = ElLoading.service
}

// 导出组件供单独使用
export {
  ElScrollbar,
  ElAutocomplete,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElSwitch,
  ElPopover,
  ElIcon,
  ElLoading,
  ElMessage,
  ElMessageBox,
  ElNotification,
}

export default setupElementPlus
