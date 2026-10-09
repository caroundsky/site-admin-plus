<template>
  <footer class="main-footer">
    <span class="main-footer__left">站点容器 Demo · 由 @caroundsky/lemon-admin 驱动</span>

    <span class="main-footer__right">
      <span v-if="activeView">页签：{{ activeView.text }}</span>
      <span>
        <i class="main-footer__dot" />
        主题：{{ themeLabel }}
      </span>
    </span>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { bus, useMenuViewsStore } from '@caroundsky/lemon-admin'
import { THEMES } from './themes'

defineOptions({ name: 'MainFooter' })

const menuViewsStore = useMenuViewsStore()

/** 当前激活的页签；插槽里同样能拿到库的 store */
const activeView = computed(() => menuViewsStore.activeView)

/** 当前主题名，与 ThemeSwitch / 自定义主题案例联动 */
const themeLabel = computed(() => {
  const name = (bus.getState('theme') as string) || 'default'
  return THEMES.find((theme) => theme.name === name)?.label ?? name
})
</script>

<style scoped>
.main-footer {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 30px;
  padding: 0 16px;
  font-size: 12px;
  color: #909399;
  background: #fff;
  border-top: 1px solid #ebeef5;
  user-select: none;
}

.main-footer__right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 直接消费库的主题变量：外部主题（含自定义主题）都会生效 */
.main-footer__dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 5px;
  vertical-align: middle;
  background: var(--theme-color, #0070b2);
  border-radius: 50%;
}
</style>
