<!--
 * iframes
-->
<template>
  <div
    :class="[
      'main-content',
      { 'stop-event': menuTabTouch },
      { 'move-in-area': menuTabMoveInArea },
    ]"
  >
    <div
      class="iframe-single"
      v-for="view in iframeList"
      :menukey="view.id"
      :key="view.id"
      :style="{ display: view.id === activeId ? 'block' : 'none' }"
    >
      <iframe
        :src="view.href"
        :ref="setIframeRef(view.id)"
        :name="view.id"
        frameborder="0"
        @load="iframeLoad(view)"
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useMenuViewsStore } from '@/stores/menuViews'
import type { MenuView } from '~/types/interfaces'

import xorBy from 'lodash/xorBy'
import intersectionBy from 'lodash/intersectionBy'
import { reflashIframe } from '@/utils/tools'

const appStore = useAppStore()
const menuViewsStore = useMenuViewsStore()

const menuTabTouch = computed(() => appStore.menuTabTouch)
const menuTabMoveInArea = computed(() => appStore.menuTabMoveInArea)
const menuViews = computed(() => menuViewsStore.views)
const activeId = computed(() => menuViewsStore.activeId)
const refreshId = computed(() => menuViewsStore.refreshId)

const iframeList = ref<MenuView[]>([])
const iframeRefs = ref<Record<string, HTMLIFrameElement>>({})

// 设置 iframe ref 的函数
const setIframeRef = (id: string) => (el: HTMLIFrameElement | null) => {
  if (el) {
    iframeRefs.value[id] = el
  }
}

/**
 * 生成iframe数据源，不使用tab源，因为tab源排序后会导致数据刷新
 */
watch(
  menuViews,
  (views) => {
    const menuKeysLength = iframeList.value.length
    const viewLength = views.length
    if (menuKeysLength !== viewLength) {
      if (viewLength > menuKeysLength) {
        // 有新增，取差集
        iframeList.value.push(...xorBy(views, iframeList.value, 'id'))
      } else {
        // 有删除，取交集
        iframeList.value = intersectionBy(iframeList.value, views, 'id')
      }
    }
  },
  { immediate: true },
)

// 刷新
watch(refreshId, (viewId) => {
  if (viewId) {
    const targetIframe = iframeRefs.value[viewId]
    if (targetIframe) {
      reflashIframe(targetIframe)
    }
  }
})

const iframeLoad = (view: MenuView) => {
  try {
    const iframeWindow = window.frames[view.id]
    if (!iframeWindow) return

    iframeWindow.document.body.addEventListener('click', () => {
      iframeWindow.parent.document.body.click()
    })
  } catch (_e) {
    // 跨域情况下可能会报错
  }
}
</script>

<style lang="less">
.main-content {
  position: relative;
  width: 100%;
  height: 100%;
  &.stop-event {
    pointer-events: none;
  }
  &::before {
    content: '';
    position: absolute;
    visibility: hidden;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    opacity: 0;
    transition: 0.45s;
  }

  &.move-in-area {
    &:before {
      visibility: visible;
      opacity: 1;
    }
    &:after {
      position: absolute;
      left: 50%;
      top: 10%;
      margin-left: -149px;
      content: '放开拖动标签即关闭该标签对应窗口！';
      box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
      font-size: 14px;
      background: #fff;
      color: rgba(0, 0, 0, 0.5);
      padding: 20px 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: showMoveTip ease 0.35s;
    }
  }

  .iframe-single {
    width: 100%;
    height: 100%;
    border: none;
    iframe {
      width: 100%;
      height: 100%;
    }
  }
}

@keyframes showMoveTip {
  0% {
    opacity: 0;
    transform: translateY(-40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
