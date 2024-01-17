import Vue, { VNode } from 'vue'
declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any
    }
  }
  interface Window {
    $tools: any
    tab: any
    newsInstantMessaging: any
    instantMessaging_Search: any
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $tools: any
    $contextmenu: any
    $dialogServe: any
    $appConfig: any
    bus: any
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    [propName: string]: any

    ref?: string
  }
}
