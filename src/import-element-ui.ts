/**
 * Element Plus 组件按需引入
 * Vue 3 版本
 */
import type { App } from 'vue'

// Element Plus 组件
import {
  ElScrollbar,
  ElDialog,
  ElAutocomplete,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElMenu,
  ElSubMenu,
  ElMenuItem,
  ElMenuItemGroup,
  ElInput,
  ElSwitch,
  ElPopover,
  ElTooltip,
  ElTabs,
  ElTabPane,
  ElButton,
  ElLoading,
  ElMessage,
  ElMessageBox,
  ElNotification,
  ElIcon,
} from 'element-plus'

// Element Plus 样式
import 'element-plus/dist/index.css'

// Element Plus 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

/**
 * 安装 Element Plus 组件到 Vue 应用
 */
export function setupElementPlus(app: App) {
  // 注册组件
  const components = [
    { name: 'ElScrollbar', component: ElScrollbar },
    { name: 'ElDialog', component: ElDialog },
    { name: 'ElAutocomplete', component: ElAutocomplete },
    { name: 'ElDropdown', component: ElDropdown },
    { name: 'ElDropdownMenu', component: ElDropdownMenu },
    { name: 'ElDropdownItem', component: ElDropdownItem },
    { name: 'ElMenu', component: ElMenu },
    { name: 'ElSubMenu', component: ElSubMenu },
    { name: 'ElMenuItem', component: ElMenuItem },
    { name: 'ElMenuItemGroup', component: ElMenuItemGroup },
    { name: 'ElInput', component: ElInput },
    { name: 'ElSwitch', component: ElSwitch },
    { name: 'ElPopover', component: ElPopover },
    { name: 'ElTooltip', component: ElTooltip },
    { name: 'ElTabs', component: ElTabs },
    { name: 'ElTabPane', component: ElTabPane },
    { name: 'ElButton', component: ElButton },
    { name: 'ElIcon', component: ElIcon },
  ]

  components.forEach(({ name, component }) => {
    app.component(name, component)
  })

  // 注册图标组件
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

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
  ElDialog,
  ElAutocomplete,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElMenu,
  ElSubMenu,
  ElMenuItem,
  ElMenuItemGroup,
  ElInput,
  ElSwitch,
  ElPopover,
  ElTooltip,
  ElTabs,
  ElTabPane,
  ElButton,
  ElIcon,
  ElLoading,
  ElMessage,
  ElMessageBox,
  ElNotification,
}

export default setupElementPlus
