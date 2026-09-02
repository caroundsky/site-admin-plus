<template>
  <component :is="renderComponents" />
</template>

<script setup lang="tsx">
import { computed, h, useAttrs } from 'vue'
import bus from '@/bus'

interface Props {
  name: string
}

const props = defineProps<Props>()
const attrs = useAttrs()

const pluginSlots = computed(() => {
  return bus.getSlots(props.name)
})

const renderPluginSlot = (slotsData: any): any => {
  try {
    // Vue 3 渲染函数直接返回数组即为 Fragment，无需显式 Fragment
    if (Array.isArray(slotsData)) {
      return slotsData.map(renderPluginSlot)
    }
    return h(slotsData, attrs)
  } catch (_e) {
    return null
  }
}

const renderComponents = computed(() => {
  return renderPluginSlot(pluginSlots.value)
})
</script>
