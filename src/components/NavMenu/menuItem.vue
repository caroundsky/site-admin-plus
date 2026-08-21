<!--
 * 菜单（无下级）
-->
<template>
  <li
    :class="[
      'bg-submenu nav-menu__item',
      `nav-menu__item-lv${level}`,
      { 'is-flat-menu': isFlatMenu },
    ]"
    @click="itemClick"
    @contextmenu.prevent="onContextmenu"
  >
    <template v-if="isPop">
      <el-popover
        placement="right-start"
        trigger="hover"
        transition="bg-pop"
        popper-class="nav-menu__submenu--pop nav-menu__submenu--close"
        width="auto"
        :hide-after="0"
      >
        <template #reference>
          <div>
            <slot />
          </div>
        </template>
        <div style="font-size: 12px" v-html="setHighlight(menuData.text)" />
      </el-popover>
    </template>
    <template v-else>
      <slot />
    </template>
  </li>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import highlight from '@/utils/highlight'
import bus from '@/bus'
import { useContextMenu } from '@/components/ContextMenu'
import type { NavMenuItem } from '~/types/interfaces'

const contextMenu = useContextMenu()

interface Props {
  level?: number
  menuData: NavMenuItem
}

const props = withDefaults(defineProps<Props>(), {
  level: 1,
})

// 注入 rootMenu
const rootMenu = inject<any>('rootMenu')

const isFlatMenu = computed(() => {
  return props.level > rootMenu.value.popoverLevel
})

const isPop = computed(() => {
  return (
    !isFlatMenu.value &&
    !rootMenu.value.asideMenuOpen &&
    !rootMenu.value.horizon
  )
})

const setHighlight = (text: string) => {
  return highlight(text, rootMenu.value.menuSearchPY)
}

const itemClick = (event: Event) => {
  event.stopPropagation()
  // 使用事件总线派发事件
  bus.emit('item-click', props.menuData)
}

const onContextmenu = (event: Event) => {
  const { id, href, text } = props.menuData
  const view = { id, href, text }

  if (
    !bus.setContextMenu['menuItem'] ||
    typeof bus.setContextMenu['menuItem'] !== 'function'
  )
    return

  const definedBtn = bus.setContextMenu['menuItem']

  contextMenu.show({
    event: event as MouseEvent,
    view,
    definedBtn: definedBtn(view),
  })
}
</script>
