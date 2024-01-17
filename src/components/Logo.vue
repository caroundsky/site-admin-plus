<!--
 * LOGO
-->
<template>
  <div
    id="menu__logo"
    :class="{
      menu__logo: true,
      'menu__logo--small': small,
    }"
    @click="handleClick"
  >
    <div
      v-if="normalizedLogo.type === 'img'"
      class="menu__logo-img"
      :style="{ backgroundImage: `url(${logo})` }"
    />
    <div v-else class="menu__logo-text">{{ logo }}</div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import isPlainObject from 'lodash/isPlainObject'
import { hasOwn } from '@/utils/tools'
import bus from '@/bus'

import _logoImg from '@/assets/logo.png'
import _logosmallImg from '@/assets/logo-sm.png'

@Component({
  name: 'Logo',
})
export default class Logo extends Vue {
  @Prop({ type: Boolean, default: false })
  small!: boolean

  get normalizedLogo() {
    const normalized: any = {
      type: '',
      normal: '',
      small: '',
    }
    const logo = bus.config?.logo
    if (isPlainObject(logo)) {
      if (logo.type === 'img') {
        normalized.type = 'img'
        normalized.normal = hasOwn(logo, 'normal') ? logo.normal : _logoImg
        normalized.small = hasOwn(logo, 'small') ? logo.small : _logosmallImg
      } else {
        normalized.normal = hasOwn(logo, 'normal') ? logo.normal : ''
        normalized.small = hasOwn(logo, 'small') ? logo.small : ''
      }
    } else {
      normalized.type = 'text'
      normalized.normal = normalized.small = logo || ''
    }
    return normalized
  }
  get logo() {
    return this.small ? this.normalizedLogo.small : this.normalizedLogo.normal
  }

  handleClick() {
    bus.$emit('logoClick')
  }
}
</script>

<style lang="less" scoped>
.menu__logo {
  position: relative;
  z-index: 1000;
  height: @menu-view-bar-height;
  text-align: center;

  &--clickable {
    cursor: pointer;
  }

  > div {
    height: 100%;
  }

  &-img {
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: auto 100%;
  }
  &-text {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }
  &--small &-text {
    font-size: 14px;
  }
}
</style>
