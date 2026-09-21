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
    style="width: 40px; text-align: center; cursor: pointer"
  >
    <MonitorIcon style="height: 40px" />
  </div>
</template>

<script setup lang="tsx">
import { useMenuViewsStore } from '@caroundsky/lemon-admin'
import MonitorIcon from './svg-icons/monitor.svg'

const menuViewsStore = useMenuViewsStore()

const addView = (menuView: any) => {
  menuViewsStore.addView(menuView)
}
</script>
