<script setup lang="tsx">
import { useMenuViewsStore } from '@/stores/menuViews'
import MonitorIcon from './svg-icons/monitor.svg'

const menuViewsStore = useMenuViewsStore()

const addView = (menuView: any) => {
  menuViewsStore.addView(menuView)
}
</script>

<template>
  <div
    class="app-act__link"
    title="网络连接测试"
    @click="
      addView({
        id: 'NET-TEST',
        text: '网络连接测试',
        href: 'https://juejin.im/',
      })
    "
    style="text-align: center"
  >
    <MonitorIcon style="height: 40px" />
  </div>
</template>
