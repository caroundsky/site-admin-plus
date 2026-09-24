<template>
  <div class="theme-switch">
    <div class="theme-switch__label">主题</div>
    <ul class="theme-switch__list">
      <li
        v-for="theme in THEMES"
        :key="theme.name"
        class="theme-switch__item"
        :class="{ 'is-active': theme.name === currentTheme }"
        :title="theme.label"
        @click="changeTheme(theme.name)"
      >
        <span class="theme-switch__dot" :style="{ backgroundColor: theme.color }" />
        <span class="theme-switch__name">{{ theme.label }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { bus } from '@caroundsky/lemon-admin'
import { THEMES } from './themes'

defineOptions({ name: 'ThemeSwitch' })

/** 当前主题名。切换后由库的 RootContainer 自动把 theme-{name} 落到 body 上 */
const currentTheme = computed(() => (bus.getState('theme') as string) || 'default')

const changeTheme = (name: string) => {
  if (name === currentTheme.value) return
  bus.setState('theme', name)
}
</script>

<style lang="scss" scoped>
.theme-switch__label {
  margin-bottom: 8px;
  font-size: 12px;
  color: #909399;
}

.theme-switch__list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.theme-switch__item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px 3px 6px;
  font-size: 12px;
  line-height: 1.6;
  color: #606266;
  cursor: pointer;
  background: #f5f7fa;
  border: 1px solid transparent;
  border-radius: 3px;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;

  &:hover {
    background: #eef2f7;
  }

  &.is-active {
    color: #303133;
    background: #fff;
    border-color: var(--theme-color, #0070b2);
  }
}

.theme-switch__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 10%);
}

.theme-switch__name {
  white-space: nowrap;
}
</style>
