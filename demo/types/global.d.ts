export {}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $dialogService: typeof import('@caroundsky/el-plus-dialog-service')['default']
  }
}
