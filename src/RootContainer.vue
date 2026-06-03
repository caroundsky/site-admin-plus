<script setup lang="tsx">
import { provide, onMounted, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useMenuStore } from '@/stores/menu'
import MainContainer from '@/layouts/index.vue'
import bus from '@/bus'
import * as tools from '@/tools'
import '@/assets/icbg/css/icbg-font.css'

// 提供全局 bus
provide('bus', bus)
provide('$tools', tools)

const appStore = useAppStore()
const menuStore = useMenuStore()

const isReady = ref(false)

// 初始化应用
appStore.init()

// 监听 setMenus 事件 - 在 setup 阶段注册，确保在 onMounted 之前就绪
const handleSetMenus = async (data: any) => {
  console.log('[RootContainer] setMenus received:', data)
  await menuStore.setNavMenu(data)
  bus.emit('setMenusCompelet')
}

bus.on('setMenus', handleSetMenus)

// 监听菜单数据变化
watch(
  () => menuStore.navMenu,
  (navMenu) => {
    console.log('[RootContainer] navMenu changed:', navMenu?.length)
    if (navMenu && navMenu.length > 0) {
      isReady.value = true
    }
  },
)

// 组件挂载后触发事件
onMounted(() => {
  console.log('[RootContainer] onMounted, emitting appCreateStart')
  // 触发 appCreateStart，让外部有机会设置菜单
  bus.emit('appCreateStart')
  bus.emit('appCreateEnd')
  bus.emit('appMounted')
})
</script>

<template>
  <MainContainer v-if="isReady" />
  <div v-else class="loading-container">
    <div class="loading-spinner"></div>
    <span>加载中...</span>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--theme-color, #0070b2);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
