<template functional>
  <div :class="['flex-main', data.class, data.staticClass]">
    <slot />
  </div>
</template>

<script>
export default {}
</script>

<style>
.flex-main {
  flex: 1;
  overflow: hidden;
}
</style>
