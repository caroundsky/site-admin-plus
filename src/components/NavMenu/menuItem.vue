<!--
 * 菜单（无下级）
-->
<template>
  <li
    :class="[
      'bg-submenu nav-menu__item',
      `nav-menu__item-lv${this.level}`,
      { 'is-flat-menu': this.isFlatMenu },
    ]"
    @click="itemClick"
    @contextmenu.prevent="onContextmenu"
  >
    <template v-if="isPop">
      <el-popover
        placement="right-start"
        trigger="hover"
        ref="popover"
        transition="bg-pop"
        popper-class="nav-menu__submenu--pop nav-menu__submenu--close"
        :closeDelay="0"
      >
        <div slot="reference">
          <slot />
        </div>
        <div
          style="font-size: 12px"
          v-html="setHighlight(this.menuData.text)"
        />
      </el-popover>
    </template>
    <template v-else>
      <slot />
    </template>
  </li>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'

import Emitter from '@/mixins/emitter'
import MenuMixin from '@/mixins/menuMixin'

import highlight from '@/utils/highlight'

import bus from '@/bus'

@Component
export default class MenuItem extends Mixins(Emitter, MenuMixin) {
  @Prop({ default: 1 })
  public level!: number

  get isFlatMenu(): boolean {
    return this.level > this.rootMenu.popoverLevel
  }

  get isPop(): boolean {
    return (
      !this.isFlatMenu && !this.rootMenu.asideMenuOpen && !this.rootMenu.horizon
    )
  }

  setHighlight(text: string) {
    return highlight(text, this.rootMenu.menuSearchPY)
  }

  itemClick(event: Event) {
    event.stopPropagation()
    this.dispatch('NavMenu', 'item-click', this.menuData)
  }

  onContextmenu(event: Event) {
    const { id, href, text } = this.menuData
    const view = { id, href, text }

    if (
      !bus.setContextMenu['menuItem'] ||
      typeof bus.setContextMenu['menuItem'] !== 'function'
    )
      return

    const definedBtn = bus.setContextMenu['menuItem']

    this.$contextmenu({
      event,
      view,
      definedBtn: definedBtn(view),
      setOffset: this.isFlatMenu ? { x: 30, y: 30 } : { x: 20, y: 0 },
      queryClass: this.isFlatMenu
        ? 'bg-submenu__title-txt'
        : 'bg-submenu__title',
      appendToBody: !this.isFlatMenu,
      reference: this.rootMenu.horizon
        ? 'el-scrollbar__wrap'
        : 'nav-menu__submenu--pop__container',
    })
  }
}
</script>
