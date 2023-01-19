<template functional>
  <div
    :class="['hamburger', 'hamburger--arrow-r', { 'is-active': !!props.arrow }]"
    v-on="listeners"
  >
    <div class="hamburger-box">
      <div class="hamburger-inner"></div>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="less">
.hamburger {
  display: inline-block;

  &-box {
    position: relative;
    display: inline-block;
    width: 20px;
    height: 12px;
  }

  &-inner {
    top: 50%;
    display: block;
    margin-top: -2px;

    &,
    &::after,
    &::before {
      position: absolute;
      width: 20px;
      height: 2px;
      background-color: #000;
      border-radius: 2px;
      transition-delay: 0.1s;
      transition-timing-function: ease;
      transition-duration: 0.2s;
      transition-property: transform;
    }

    &::after,
    &::before {
      display: block;
      content: '';
    }

    &::before {
      top: -5px;
    }

    &::after {
      bottom: -5px;
    }
  }

  &--arrow-r.is-active &-inner::before {
    transform: translate3d(4px, 0, 0) rotate(45deg) scaleX(0.7);
  }

  &--arrow-r.is-active &-inner::after {
    transform: translate3d(4px, 0, 0) rotate(-45deg) scaleX(0.7);
  }
}
</style>
