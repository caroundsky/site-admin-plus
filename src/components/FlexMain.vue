<template>
  <div class="flex-main">
    <slot />
  </div>
</template>

<script setup lang="ts">
// 简单的功能组件，不需要任何 props
</script>

<style>
.flex-main {
  flex: 1;
  overflow: hidden;
}
</style>
