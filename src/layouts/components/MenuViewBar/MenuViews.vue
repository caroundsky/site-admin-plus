<!--
 * tab栏
-->
<script lang="tsx" setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'
import { useMenuViewsStore } from '@/stores/menuViews'
import { VueDraggable } from 'vue-draggable-plus'
import ScrollPane from './ScrollPane.vue'
import applyDrag from '@/utils/applyDrag'

import type { MenuView } from '~/types/interfaces'

import sortBy from 'lodash/sortBy'
import bus from '@/bus'
import { useContextMenu } from '@/components/ContextMenu'

const contextMenu = useContextMenu()

const appStore = useAppStore()
const menuViewsStore = useMenuViewsStore()

const isAsideMenu = computed(() => appStore.isAsideMenu)
const menuViews = computed(() => menuViewsStore.views)
const activeId = computed(() => menuViewsStore.activeId)

const FIXED_DRAG = computed(
  () => bus.config.FIXED_DRAG || [bus.config.HOME_PAGE],
)

const viewTabsWidth = ref(700)
const hoverIndex = ref(-1)
const removeOnDropOut = ref(false)
const animaDuration = ref(250)
const moveInArea = ref(false)

const scrollPaneRef = ref<any>(null)
const containerRef = ref<any>(null)
const tagRefs = ref<any[]>([])

let contentArea: HTMLElement | null = null
let mainCont: HTMLElement | null = null
let moveView: MenuView | null = null

// 监听 activeId 变化
watch(activeId, async (id) => {
  const targetMenu = menuViews.value.find((menu) => menu.id === id)
  if (targetMenu && scrollPaneRef.value) {
    scrollPaneRef.value.moveToTarget(targetMenu.text, tagRefs.value)
  }
})

// 监听 menuViews 变化
watch(
  menuViews,
  () => {
    calcTabsWidth()
  },
  { deep: true },
)

// 监听 isAsideMenu 变化
watch(isAsideMenu, () => {
  calcTabsWidth()
})

const calcTabsWidth = async () => {
  await nextTick()
  if (!tagRefs.value || tagRefs.value.length === 0) return

  let result = 0
  for (const el of tagRefs.value) {
    if (el && el.$el) {
      result += el.$el.getBoundingClientRect().width
    }
  }
  viewTabsWidth.value = Math.ceil(result)
}

const onDrop = (dropResult: any) => {
  const targetId = menuViewsStore.views[dropResult.addedIndex]?.id
  if (FIXED_DRAG.value.includes(targetId)) return

  const newViews = applyDrag([...menuViewsStore.views], dropResult)
  menuViewsStore.views = newViews
}

const onDragStart = (dragResult: any) => {
  animaDuration.value = 250
  appStore.setMenuTabTouch(true)

  nextTick(() => {
    const ghostDom = document.querySelector('.smooth-dnd-ghost') as HTMLElement
    if (!ghostDom) return

    contentArea = document.querySelector('.flex-main__content')
    mainCont = document.querySelector('.main-content')
    if (!contentArea) return

    moveView = dragResult.payload
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mousemove', onMouseMove)
  })
}

const onMouseUp = () => {
  const srcElement = (window.event as MouseEvent)?.srcElement as HTMLElement
  if (contentArea && srcElement && contentArea.contains(srcElement)) {
    const ghostDom = document.querySelector('.smooth-dnd-ghost') as HTMLElement
    if (ghostDom) {
      ghostDom.style.display = 'none'
    }
    removeOnDropOut.value = true
    if (moveView) {
      menuViewsStore.closeView(moveView)
    }
  }

  appStore.setMenuTabTouch(false)
  appStore.setMenuTabMoveInArea(false)
  moveInArea.value = false
  document.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('mousemove', onMouseMove)
  removeOnDropOut.value = false
}

const onMouseMove = () => {
  const srcElement = (window.event as MouseEvent)?.srcElement as HTMLElement
  if (contentArea && srcElement && contentArea.contains(srcElement)) {
    if (mainCont?.classList.contains('move-in-area')) return
    animaDuration.value = 0
    moveInArea.value = true
    appStore.setMenuTabMoveInArea(true)
  } else {
    if (mainCont && !mainCont.classList.contains('move-in-area')) return
    animaDuration.value = 250
    moveInArea.value = false
    appStore.setMenuTabMoveInArea(false)
  }
}

const onContextmenu = (event: MouseEvent, view: MenuView, index: number) => {
  event.preventDefault()

  if (
    !bus.setContextMenu['menuViewBar'] ||
    typeof bus.setContextMenu['menuViewBar'] !== 'function'
  )
    return

  const definedBtn = bus.setContextMenu['menuViewBar']

  hoverIndex.value = index
  contextMenu.show({
    event,
    view,
    definedBtn: definedBtn(view),
    afterDestory: () => {
      hoverIndex.value = -1
    },
  })
}

// 对 menuViews 做排序
const sortMenuViews = computed(() => {
  return sortBy(menuViews.value, [
    (view) => {
      return !FIXED_DRAG.value.includes(view.id)
    },
  ])
})
</script>

<template>
  <ScrollPane ref="scrollPaneRef" class="view-tabs-scroll">
    <VueDraggable
      ref="containerRef"
      v-model="sortMenuViews"
      :animation="animaDuration"
      class="view-tabs-wrap"
      :style="{ width: `${viewTabsWidth}px` }"
      @start="onDragStart"
      @end="onDrop"
    >
      <template #item="{ element: view, index }">
        <div
          :ref="(el: any) => (tagRefs[index] = el)"
          :class="{
            'view-tab-wrap': true,
            'no-draggable': FIXED_DRAG.includes(view.id),
            'in-area': moveInArea,
          }"
          :title="view.text"
        >
          <div
            :key="view.id"
            :class="{
              'view-tab': true,
              'view-tab--horizon': !isAsideMenu,
              'view-tab--active': view.id === activeId,
              'view-tab--hover': hoverIndex === index && view.id !== activeId,
            }"
            @click="menuViewsStore.activeView(view)"
            @contextmenu="(e: MouseEvent) => onContextmenu(e, view, index)"
          >
            <span class="view-tab__text" v-html="view.text" />
            <span
              v-if="view.closable"
              class="view-tab__close"
              @click.stop="menuViewsStore.closeView(view)"
            >
              <el-icon><Close /></el-icon>
            </span>
          </div>
        </div>
      </template>
    </VueDraggable>
  </ScrollPane>
</template>

<style lang="less" scoped>
.smooth-dnd-ghost .view-tab {
  box-shadow: 0 0 10px 0 #d1d1d1;
  background-color: #fff;
  color: #333;
  &::after {
    display: none;
  }
}

.view-tabs-scroll {
  position: relative;
  height: 100%;
}

.view-tab {
  position: relative;
  display: inline-block;
  margin-right: -1px;
  line-height: @menu-view-bar-height;
  cursor: pointer;
  background-color: #fff;
  user-select: none;
  font-size: 14px;

  &-wrap {
    display: inline-block !important;
  }

  &::after {
    content: '';
    right: 0;
    position: absolute;
    z-index: 2;
    top: 50%;
    display: block;
    width: 1px;
    height: 12px;
    background-color: #ddd;
    transform: translateY(-50%);
  }

  &:hover {
    z-index: 1;
    .view-tab__close {
      opacity: 1;
    }
  }

  &--active {
    color: #fff;
    background-color: rgb(0, 112, 178);
    background-color: var(--theme-color);
    z-index: 2;
    transition:
      background-color 0.2s,
      color 0.2s;

    &::after {
      display: none;
    }
    &:hover {
      z-index: 3;
      .view-tab__close {
        color: #fff;
      }
    }
  }

  &--hover {
    color: var(--theme-color);
    background-color: rgba(0, 112, 178, 0.2);
  }

  &-wrap {
    &.in-area {
      transition-duration: 0ms !important;
    }
  }

  .view-tab__text {
    display: block;
    padding: 0 1.2em;
    transition: transform 0.2s;
  }

  .view-tab__close {
    position: absolute;
    padding: 1px;
    width: 1em;
    height: 1em;
    line-height: 1em;
    font-size: 12px;
    font-weight: 700;
    top: 2px;
    right: 2px;
    color: #333;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.1s;
    background-color: transparent;
    opacity: 0;

    &:hover {
      color: #fff;
      background-color: #d9413c;
    }
  }
}

.view-tab:not(.view-tab--active):hover {
  color: rgb(0, 112, 178);
  color: var(--theme-color);
  background-color: rgba(0, 112, 178, 0.2);
}

.view-tab--horizon {
  font-size: 12px;
  line-height: @menu-view-bar-height - 10px;
  border-radius: 3px 3px 0px 0px;
}

.no-draggable {
  transform: none !important;
}
</style>
