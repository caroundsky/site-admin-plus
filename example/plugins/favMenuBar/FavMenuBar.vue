<!--
 * 底栏
-->
<template>
  <FlexContainer
    :class="['fav-menu-bar', { 'fav-menu-bar__collapse': collapse }]"
  >
    <div
      v-show="!favMenuMap[activeMenuId]"
      :class="['fav-menu__act', { disabled: activeMenuId === HOME_PAGE }]"
      @click="handleAddFav"
    >
      <el-icon><CirclePlus /></el-icon>
      {{ $t('加入收藏') }}
    </div>
    <div
      v-show="favMenuMap[activeMenuId]"
      class="fav-menu__act"
      @click="handleDelFav"
    >
      <el-icon><Remove /></el-icon>
      {{ $t('取消收藏') }}
    </div>
    <FlexMain class="fav-menu__main">
      <FlexContainer>
        <FlexMain>
          <el-scrollbar
            ref="scrollPaneRef"
            class="view-tabs-scroll"
            @wheel.prevent="handleWheel"
          >
            <VueDraggable
              v-model="favMenu"
              class="view-tabs-wrap"
              :animation="150"
            >
              <span
                v-for="(item, index) in favMenu"
                :key="item.id"
                :class="[
                  'fav-menu__item',
                  { 'fav-menu__item--hover': hoverIndex === index },
                ]"
                @click="() => handleFavClick(item.id)"
                @contextmenu.prevent="(e) => onContextmenu(e, item, index)"
              >
                {{ item.text }}
              </span>
            </VueDraggable>
          </el-scrollbar>
        </FlexMain>
      </FlexContainer>
    </FlexMain>
    <div
      class="fav-menu__act"
      :title="collapse ? '展开' : '收起'"
      @click="handleCollapse"
    >
      <el-icon>
        <CaretTop v-if="collapse" />
        <CaretBottom v-else />
      </el-icon>
    </div>
  </FlexContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import {
  CirclePlus,
  Remove,
  CaretTop,
  CaretBottom,
} from '@element-plus/icons-vue'
import { bus, useMenuViewsStore } from '@caroundsky/lemon-admin'
import type { MenuView } from '@caroundsky/lemon-admin'

import buttons from '../contextMenu/buttons'
import { useFavMenuStore } from '../favMenuBar/storeModule'

const favMenuStore = useFavMenuStore()
const menuViewsStore = useMenuViewsStore()

const scrollPaneRef = ref<any>(null)

// 滚轮转为横向滚动（库内部的 ScrollPane 不再对外导出，插件自带这份行为）
const handleWheel = (e: WheelEvent) => {
  const wrap = scrollPaneRef.value?.wrap
  if (!wrap) return
  const delta = (e as any).wheelDelta || -e.deltaY * 40
  wrap.scrollLeft = wrap.scrollLeft - delta / 4
}
const hoverIndex = ref(-1)
const collapse = ref(false)

const HOME_PAGE = bus.config.HOME_PAGE

const activeMenuId = computed(() => menuViewsStore.activeId || '')
const activeView = computed(() => menuViewsStore.activeView)
const favMenu = computed({
  get: () => favMenuStore.favMenu,
  set: (val) => {
    favMenuStore.favMenu = val
  },
})
const favMenuMap = computed(() => favMenuStore.favMenuMap)

const handleAddFav = () => {
  if (!activeMenuId.value || activeMenuId.value === HOME_PAGE) return
  if (!activeView.value) return
  favMenuStore.addFav(activeView.value)
}

const handleDelFav = () => {
  if (!activeView.value) return
  favMenuStore.delFav(activeView.value)
}

const handleFavClick = (menuId: string) => {
  menuViewsStore.addViewById(menuId)
}

const handleCollapse = () => {
  collapse.value = !collapse.value
}

const onContextmenu = (event: MouseEvent, view: MenuView, index: number) => {
  event.preventDefault()

  hoverIndex.value = index
  // TODO: contextmenu
  console.log(
    'contextmenu',
    event,
    view,
    buttons(view, ['windowOpen', 'collect']),
  )
  hoverIndex.value = -1
}
</script>

<style lang="scss" scoped>
// 横向滚动容器：只留横向滚动条，隐藏纵向
.view-tabs-scroll {
  :deep(.lemon-scrollbar__bar.is-horizontal) {
    bottom: 0;
  }
  :deep(.lemon-scrollbar__bar.is-vertical) {
    display: none;
  }
  :deep(.lemon-scrollbar__wrap) {
    height: 50px;
  }
}

.fav-menu-bar {
  height: 28px;
  line-height: 28px;
  font-size: 12px;
  box-shadow: 0 0 4px 1px #e1e1e1;
  background: #fff;
  display: flex;

  & > div:not(:last-child) {
    transition: ease 0.3s;
  }

  &__collapse {
    transition-delay: 250ms;
    height: 0;
    & > div:not(:last-child) {
      transform: translateY(100%);
    }
    & > div:last-child {
      transition-delay: 250ms;
      background: #fff;
      box-shadow:
        0 2px 6px rgba(0, 0, 0, 0.23),
        0 0px 5px rgba(0, 0, 0, 0.03);
      transition-property: transform;
      transform: translateY(-100%);
    }
  }
}

.view-tabs-wrap {
  display: flex;
}

.fav-menu__act {
  color: #288add;
  color: var(--theme-color);
  border: none;
  background-color: transparent;
  height: 28px;
  cursor: pointer;
  outline: none;
  padding: 0 1em;

  &.disabled {
    color: #c0c0c0;
    cursor: no-drop;
  }

  &:hover:not(.disabled) {
    background-color: rgb(204, 226, 240);
  }
}

.fav-menu__item {
  display: block;
  padding: 0 1em;
  cursor: pointer;
  white-space: nowrap;

  &:hover,
  &--hover {
    color: #288add;
    color: var(--theme-color);
    background-color: rgba(0, 112, 178, 0.2);
  }
}
</style>
