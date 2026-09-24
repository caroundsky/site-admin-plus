<template>
  <MainContainer v-if="isReady" />
  <div v-else class="loading-container">
    <div class="loading-spinner"></div>
    <span>加载中...</span>
  </div>
</template>

<script setup lang="tsx">
import { computed, provide, onMounted, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useMenuStore } from '@/stores/menu'
import MainContainer from '@/layouts/index.vue'
import bus from '@/bus'
import * as tools from '@/tools'

// 提供全局 bus
provide('bus', bus)
provide('$tools', tools)

/**
 * 主题
 *
 * themes.scss 把主题色变量定义在 `body.theme-{name}` 选择器下（见 src/styles/themes.scss），
 * 这里负责把当前主题落地到 body：
 *  - 未接主题时兜底 `theme-default`，保证 `--theme-color` 等变量不为空；
 *  - 跟随 `bus.setState('theme', ...)` 自动切换，消费方无需再写主题插件。
 */
const DEFAULT_THEME = 'default'

const applyBodyTheme = (name: string) => {
  const body = document.body
  // 倒序遍历：边删边遍历时不会漏项
  for (let i = body.classList.length - 1; i >= 0; i--) {
    const cls = body.classList.item(i)
    if (cls?.startsWith('theme-')) body.classList.remove(cls)
  }
  body.classList.add(`theme-${name || DEFAULT_THEME}`)
}

const currentTheme = computed(
  () => (bus.getState('theme') as string) || DEFAULT_THEME,
)
watch(currentTheme, applyBodyTheme, { immediate: true })

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
    if (navMenu && navMenu.length > 0) {
      isReady.value = true
    }
  },
  // immediate 必须加：容器可能被卸载后重新挂载（典型场景是「退出登录 → 再次登录」，
  // 中间路由切到登录页导致容器销毁）。重新挂载时 isReady 重置为 false，而 store 里
  // 已有菜单数据，再次 setNavMenu 赋的是同一个数组引用、不会触发 watch，
  // 于是页面永远停在「加载中」。
  { immediate: true },
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
