<template>
  <div
    :class="[
      'flex-container',
      { 'flex-container--vertical': vertical !== false },
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  vertical?: boolean
}

withDefaults(defineProps<Props>(), {
  vertical: false,
})
</script>

<style lang="less">
.flex-container {
  display: flex;
}
.flex-container--vertical {
  flex-direction: column;
}
</style>
