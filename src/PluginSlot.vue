<template>
  <component :is="renderComponents" />
</template>

<script setup lang="tsx">
import type { Component, VNode } from 'vue'
import { computed, h, useAttrs } from 'vue'
import bus from '@/bus'

interface Props {
  name: string
}

const props = defineProps<Props>()
const attrs = useAttrs()

const pluginSlots = computed<Component[]>(() => bus.getSlots(props.name) ?? [])

/**
 * 把插槽组件包成一个函数式组件再交给 <component :is>。
 *
 * 不能直接把数组传给 :is —— 数组会被当作组件定义，触发
 * "Component is missing template or render function: Array(1)" 且插槽不渲染。
 * 函数式组件返回数组时，Vue 会自动按 Fragment 处理，这正是这里需要的行为。
 */
const renderComponents = computed(
  () => () =>
    pluginSlots.value.map((slot): VNode | null => {
      try {
        return h(slot, attrs)
      } catch {
        return null
      }
    }),
)
</script>
