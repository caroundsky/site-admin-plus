<!--
 * iframes
-->
<template>
  <div
    :class="[
      'main-content',
      { 'stop-event': menuTabTouch },
      { 'move-in-area': menuTabMoveInArea }
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
        :ref="view.id"
        :name="view.id"
        frameborder="0"
        @load="iframeLoad(view)"
      ></iframe>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { MenuView } from '~/types/interfaces'

import { xorBy, intersectionBy } from 'lodash'
import { reflashIframe } from '@/utils/tools'

const MenuViewsModule = namespace('menuViews')
const AppModule = namespace('app')

@Component
export default class MainContent extends Vue {
  @AppModule.State('menuTabTouch')
  public menuTabTouch!: boolean

  @AppModule.State('menuTabMoveInArea')
  public menuTabMoveInArea!: boolean

  @MenuViewsModule.State('views')
  public menuViews!: MenuView[]

  @MenuViewsModule.State('activeId')
  public activeId!: MenuView

  @MenuViewsModule.State('refreshId')
  public refreshId!: MenuView['id']

  public iframeList: MenuView[] = []

  /**
   * 生成iframe数据源，不使用tab源，因为tab源排序后会导致数据刷新
   */
  @Watch('menuViews', { immediate: true })
  handleMenuViews(view: MenuView[]) {
    const menuKeysLength = this.iframeList.length
    const viewLength = view.length
    if (menuKeysLength !== viewLength) {
      if (viewLength > menuKeysLength) {
        // 有新增，取差集
        this.iframeList.push(...xorBy(view, this.iframeList, 'id'))
      } else {
        // 有删除，取交集
        this.iframeList = intersectionBy(this.iframeList, view, 'id')
      }
    }
  }

  // 刷新
  @Watch('refreshId')
  async handleRefreshId(viewId: MenuView['id']) {
    if (viewId) {
      const targetIframe = (this as any).$refs[viewId][0]
      reflashIframe(targetIframe)
    }
  }

  iframeLoad(view: MenuView) {
    try {
      const iframeWindow = window.frames[view.id]
      if (!iframeWindow) return

      iframeWindow.document.body.addEventListener('click', () => {
        iframeWindow.parent.document.body.click()
      })
    } catch (e) {}
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
