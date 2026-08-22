<template>
  <ScrollPane ref="scrollPaneRef" class="view-tabs-scroll">
    <VueDraggable
      ref="containerRef"
      v-model="sortMenuViews"
      :animation="animaDuration"
      class="view-tabs-wrap"
      draggable=".view-tab-wrap"
      filter=".no-draggable"
      :prevent-on-filter="false"
      :force-fallback="true"
      fallback-class="smooth-dnd-ghost"
      @start="onDragStart"
      @end="onDrop"
      @choose="onChoose"
    >
      <div
        v-for="(view, index) in sortMenuViews"
        :key="view.id"
        :ref="(el: any) => (tagRefs[index] = el)"
        :class="{
          'view-tab-wrap': true,
          'no-draggable': FIXED_DRAG.includes(view.id),
          'in-area': moveInArea,
        }"
        :title="view.text"
      >
        <div
          :class="{
            'view-tab': true,
            'view-tab--horizon': !isAsideMenu,
            'view-tab--active': view.id === activeId,
            'view-tab--hover': hoverIndex === index && view.id !== activeId,
          }"
          @click="menuViewsStore.activeViewById(view.id)"
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
    </VueDraggable>
  </ScrollPane>
</template>

<script lang="tsx" setup>
import { ref, computed, watch } from 'vue'
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

// Sortable 在 force-fallback 模式的 dragStart 时会置位模块级 ignoreNextClick，
// 该标志仅在 _onDragOver 中复位；快速拖入内容区时 _onDragOver 可能一次都不触发
// （elementFromPoint 未落在 sortable 容器上），标志残留会导致其 document 捕获阶段
// 的监听器吞掉拖拽结束后的第一次点击（preventDefault + stopImmediatePropagation）。
// 这里在拖拽结束时主动派发一次合成点击烧掉该标志；
// 通过捕获监听器识别标记并阻止传播，避免标志未残留时误伤其他全局点击监听
const burnSortableClickGuard = () => {
  const swallow = (e: MouseEvent) => {
    if ((e as any).__burnSortableClickGuard) {
      e.preventDefault()
      e.stopImmediatePropagation()
    }
  }
  document.addEventListener('click', swallow, true)
  const evt = new MouseEvent('click', { bubbles: true, cancelable: true })
  ;(evt as any).__burnSortableClickGuard = true
  document.body.dispatchEvent(evt)
  document.removeEventListener('click', swallow, true)
}

const onDrop = (dropResult: any) => {
  const targetId = menuViewsStore.views[dropResult.addedIndex]?.id
  if (FIXED_DRAG.value.includes(targetId)) return

  const newViews = applyDrag([...menuViewsStore.views], dropResult)
  menuViewsStore.views = newViews

  // 烧掉 Sortable 可能残留的点击抑制标志，保证拖拽后的第一次点击不被吞
  burnSortableClickGuard()
}

const onDragStart = (dragResult: any) => {
  animaDuration.value = 250
  appStore.setMenuTabTouch(true)

  // Sortable 的 start 事件没有 payload（那是 vue-smooth-dnd 的 API），
  // 用 oldIndex 从当前列表中取被拖拽的 view
  moveView = sortMenuViews.value[dragResult.oldIndex] || null

  contentArea = document.querySelector('.flex-main__content')
  mainCont = document.querySelector('.main-content')
  if (!contentArea) return

  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('mousemove', onMouseMove)
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

// Sortable choose 阶段（mousedown 同步触发）直接操作 DOM 屏蔽内容区事件。
// 不能等 Vue 把 stop-event 渲染到 .main-content：start -> 渲染之间存在时间窗，
// 鼠标在此窗口内移入 iframe 区域会导致后续 mousemove/mouseup 落入 iframe，
// Sortable 收不到 mouseup 使拖拽卡死、stop-event 与拖拽残影永久残留
const onChoose = () => {
  document.querySelector('.main-content')?.classList.add('stop-event')
  // 无论 Sortable 的 drop 流程是否完整走完，抬起鼠标时都必须解除屏蔽
  document.addEventListener(
    'mouseup',
    () => {
      document.querySelector('.main-content')?.classList.remove('stop-event')
    },
    { once: true, capture: true },
  )
}

const onMouseMove = (e: MouseEvent) => {
  const srcElement = document.elementFromPoint(
    e.clientX,
    e.clientY,
  ) as HTMLElement | null
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

// 对 menuViews 做排序；setter 回写 store 以支持拖拽排序
const sortMenuViews = computed<MenuView[]>({
  get() {
    return sortBy(menuViews.value, [
      (view) => {
        return !FIXED_DRAG.value.includes(view.id)
      },
    ])
  },
  set(val) {
    menuViewsStore.views = val
  },
})
</script>

<style lang="less" scoped>
.smooth-dnd-ghost {
  // 拖拽中的悬浮克隆体不拦截鼠标事件，保证 elementFromPoint 能穿透检测下方区域
  pointer-events: none;

  .view-tab {
    box-shadow: 0 0 10px 0 #d1d1d1;
    background-color: #fff;
    color: #333;
    &::after {
      display: none;
    }
  }
}

.view-tabs-scroll {
  position: relative;
  height: 100%;
}

// 宽度自适应内容，由 el-scrollbar 处理横向溢出滚动，
// 不再用 JS 测量各 tab 宽度（测量时机不可靠会导致 tab 被裁剪）
.view-tabs-wrap {
  width: max-content;
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
    z-index: 11111;
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
<!--
 * tab栏
-->
