<!--
 * 菜单列（含下级）
-->
<script lang="tsx" setup>
import { ref, computed, watch, inject, useSlots } from 'vue'
import type { NavMenuItem } from '~/types/interfaces'

import BgCollapseTransition from '@/transitions/collapse-transition'

import bus from '@/bus'

const sumArr = (arr: number[]) => arr.reduce((r, v) => r + v, 0)

/**
 * 横版菜单 pop 分列算法（迁移自 Vue 2 版）
 * 按各二级菜单的子孙节点数量，把菜单均衡分配到多列，
 * 使每列节点总数尽量接近平均值（允许 buffer 浮动）
 */
function splitColumn(
  arr: number[] = [],
  columns = 4,
  columnBaseCount = 20,
  buffer = 12,
): number[][] {
  const maxColumns = Math.min(arr.length, columns)
  const columnSum = sumArr(arr)
  const columnAvg = columnSum / maxColumns
  const maxColumnBaseCount = Math.max(...arr, columnAvg, columnBaseCount)
  if (maxColumnBaseCount !== columnBaseCount || maxColumns !== columns) {
    return splitColumn(arr, maxColumns, maxColumnBaseCount)
  }

  const result: number[][] = []
  let curColumn = 0
  let curColumnSum = 0
  buffer = Math.min(maxColumnBaseCount * 0.3, buffer)

  arr.forEach((item) => {
    if (curColumnSum + item < maxColumnBaseCount + buffer) {
      curColumnSum = curColumnSum + item
    } else if (curColumn < maxColumns - 1) {
      curColumn++
      curColumnSum = item
    }
    result[curColumn] = result[curColumn] || []
    result[curColumn].push(item)
  })

  return result
}

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

// 统计一个菜单节点可见后代的数量（含自身），与旧版按 innerHTML 中
// bg-submenu__title-txt 出现次数统计的逻辑等价
const countVisibleNodes = (menu: NavMenuItem): number => {
  let count = 1
  menu.children?.forEach((child) => {
    if (child && child.show) {
      count += countVisibleNodes(child)
    }
  })
  return count
}

// pop 内单项高度 24px（font-size 12px × line-height 2）+ popover 上下内边距 18px
const POP_ITEM_HEIGHT = 24
const POP_PADDING_Y = 18

// 横版菜单 popover 的分列布局：由 menuData 预估内容高度，超出
// horizonPopMaxH 时按 splitColumn 算法分列。在 popover 打开前即可算出
// 最终列数与宽度，无需测量 DOM，打开即是最终布局
const splitLayout = computed(() => {
  const columnWidth = rootMenu?.value?.popoverColumnMaxWidth || 240
  const maxH = rootMenu?.value?.horizonPopMaxH || window.innerHeight * 0.8
  const children = (props.menuData.children || []).filter(
    (child) => child && child.show,
  )
  const totalCount = children.reduce((n, c) => n + countVisibleNodes(c), 0)

  if (totalCount * POP_ITEM_HEIGHT + POP_PADDING_Y <= maxH) {
    return { sizes: [] as number[], width: columnWidth }
  }

  const groups = splitColumn(children.map(countVisibleNodes))
  const sizes = groups.map((group) => group.length)
  return { sizes, width: columnWidth * sizes.length }
})

const overPopHeight = computed(() => splitLayout.value.sizes.length > 0)
const horizonPopWidth = computed(() => splitLayout.value.width)
// 横版菜单 popover 的最大高度（超出滚动）
const horizonPopMaxH = computed(() => {
  return rootMenu?.value?.horizonPopMaxH || undefined
})

// 按分列结果把 slot 节点切分为多列（renderMenuItem 对隐藏菜单返回
// null，需先过滤，与 countVisibleNodes 的统计口径一致）
const departColumns = computed(() => {
  const { sizes } = splitLayout.value
  if (!sizes.length) return []
  const vnodes = (slots.default?.() || []).filter(Boolean)
  const columns: any[][] = []
  let cursor = 0
  for (const size of sizes) {
    columns.push(vnodes.slice(cursor, cursor + size))
    cursor += size
  }
  return columns
})

// 函数式组件：渲染一组 vnode 节点（用于分列）
const VnodeColumn = (props: { nodes: any[] }) => props.nodes
VnodeColumn.props = { nodes: { type: Array, required: true } }
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
        width="auto"
        :hide-after="100"
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
        :hide-after="100"
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
            <template v-if="overPopHeight">
              <div
                v-for="(column, i) in departColumns"
                :key="i"
                class="nav-menu__submenu--pop__depart"
              >
                <VnodeColumn :nodes="column" />
              </div>
            </template>
            <slot v-else />
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
