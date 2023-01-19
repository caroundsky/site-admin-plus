<template functional>
  <div
    :class="[
      'flex-container',
      { 'flex-container--vertical': props.vertical !== false },
      data.class,
      data.staticClass
    ]"
  >
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    vertical: {
      default: false
    }
  }
}
</script>

<style lang="less">
.flex-container {
  display: flex;
}
// .flex-container .flex-container {
//   flex: 1;
// }
.flex-container--vertical {
  flex-direction: column;
}
</style>
