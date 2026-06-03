/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 新模块声明
declare module 'vue-draggable-plus'
declare module 'mitt'
declare module 'localforage'

// 第三方库类型声明（如需要）
declare module 'nprogress'
