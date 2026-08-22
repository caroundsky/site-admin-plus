<template>
  <component :is="renderComponents" />
</template>

<script setup lang="tsx">
import { computed, h, Fragment, useAttrs } from 'vue'
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
    if (Array.isArray(slotsData)) {
      return <Fragment>{slotsData.map(renderPluginSlot)}</Fragment>
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
