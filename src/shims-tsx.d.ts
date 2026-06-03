/// <reference types="vite/client" />

import type { VNode, ComponentPublicInstance } from 'vue'

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementClass extends ComponentPublicInstance {
      $props: Record<string, any>
    }
    interface IntrinsicElements {
      [elem: string]: any
    }
    interface ElementAttributesProperty {
      $props: {}
    }
    interface ElementChildrenAttribute {
      children: {}
    }
  }

  interface Window {
    $tools: any
    tab: any
    newsInstantMessaging: any
    instantMessaging_Search: any
  }
}

// Vue 3 全局属性声明
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $tools: any
    $contextmenu: any
    $dialogServe: any
    $appConfig: any
    $message: typeof import('element-plus').ElMessage
    $msgbox: typeof import('element-plus').ElMessageBox
    $notify: typeof import('element-plus').ElNotification
    $loading: typeof import('element-plus').ElLoading.service
  }
}

export {}
