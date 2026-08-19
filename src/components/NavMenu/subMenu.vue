<!--
 * 菜单列（含下级）
-->
<script lang="tsx" setup>
import { ref, computed, watch, inject, useSlots } from 'vue'
import type { NavMenuItem } from '~/types/interfaces'

import BgCollapseTransition from '@/transitions/collapse-transition'

import bus from '@/bus'

interface Props {
  menuData: NavMenuItem
  level?: number
  hasChildren?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  level: 1,
  hasChildren: false,
})

const slots = useSlots()
const rootMenu = inject<any>('rootMenu')

const opened = ref(false)
const showPop = ref(false)
const inlineTitle = ref<any>(null)
const popTitle = ref<any>(null)

const isMenuPopup = computed(() => {
  return props.level === rootMenu?.value?.popoverLevel
})

const isFlatMenu = computed(() => {
  return props.level > rootMenu?.value?.popoverLevel
})

const index = computed(() => props.menuData.id)

// 监听 openedMenus 变化（deep:true 感知数组内 push/splice 的变化）
watch(
  () => rootMenu?.value?.openedMenus,
  (val: string[]) => {
    if (val) {
      opened.value = val.indexOf(index.value) > -1
    }
  },
  { deep: true },
)

// 监听 asideMenuOpen 变化
watch(
  () => rootMenu?.value?.asideMenuOpen,
  (val: boolean) => {
    if (val) {
      inlineTitle.value = slots.default?.()?.[0]
      popTitle.value = null
    }
  },
)

const subMenuClick = (e: Event) => {
  e.stopPropagation()
  if (isMenuPopup.value) return
  bus.emit('subMenu-click', {
    index: index.value,
    indexPath: [], // TODO: 需要计算 indexPath
  })
}

const subMenuEnter = (e: Event) => {
  e.stopPropagation()
  showPop.value = true
}

// 横版菜单 popover 的宽度（固定列宽）与最大高度（超出滚动）
const horizonPopWidth = computed(() => {
  return rootMenu?.value?.popoverColumnMaxWidth || 240
})
const horizonPopMaxH = computed(() => {
  return rootMenu?.value?.horizonPopMaxH || undefined
})
</script>

<template>
  <li
    :class="[
      'bg-submenu nav-menu__item',
      `nav-menu__item-lv${level}`,
      {
        'is-opened': !isMenuPopup && opened,
        'nav-menu__item--has-child': hasChildren,
        'is-pop': isMenuPopup,
      },
    ]"
    @click="subMenuClick"
    @mouseenter="subMenuEnter"
  >
    <template v-if="isMenuPopup">
      <el-popover
        v-if="!rootMenu?.horizon"
        placement="right-start"
        trigger="hover"
        transition="bg-pop"
        popper-class="nav-menu__submenu--pop"
        :hide-after="0"
        :disabled="!hasChildren"
      >
        <template #reference>
          <slot name="title" />
        </template>
        <div v-if="showPop" class="nav-menu__submenu--pop__container">
          <slot />
        </div>
      </el-popover>
      <el-popover
        v-else
        placement="bottom-start"
        trigger="hover"
        transition="bg-pop-horizon"
        popper-class="nav-menu__submenu--pop nav-menu__submenu--pop-horizon"
        :width="horizonPopWidth"
        :show-after="0"
        :hide-after="20"
        :disabled="!hasChildren"
      >
        <template #reference>
          <slot name="title" />
        </template>
        <el-scrollbar
          v-if="showPop"
          class="scroller"
          :max-height="horizonPopMaxH"
        >
          <div
            class="nav-menu__submenu--pop__container nav-menu__submenu--pop__horizon"
          >
            <slot />
          </div>
        </el-scrollbar>
      </el-popover>
    </template>
    <template v-else>
      <slot name="title" />
      <BgCollapseTransition v-if="!isFlatMenu">
        <ul v-if="opened" class="bg-menu">
          <slot />
        </ul>
      </BgCollapseTransition>
      <ul v-else class="bg-menu">
        <slot />
      </ul>
    </template>
  </li>
</template>
