<!--
 * 右键菜单
-->
<template>
  <transition :name="transitionName">
    <div
      v-show="visible"
      :class="['bgcb-contextmenu', { contrast }]"
      :style="{ left: `${style.left}px`, top: `${style.top}px` }"
      @mouseleave="destroy"
    >
      <li
        class="bgcb-contextmenu-item"
        v-for="(item, index) in buttons"
        :key="index"
        @click="itemClick(item)"
      >
        <i :class="item.icon || null" />
        <span>{{ item.label }}</span>
      </li>
    </div>
  </transition>
</template>

<script lang="ts">
interface Style {
  left: number
  top: number
}
import { Component, Vue } from 'vue-property-decorator'
import { getElementsByClassName } from '@/utils/tools'
import { MenuView, ContextButton } from '~/types/interfaces'

@Component
export default class RightMenu extends Vue {
  public visible: boolean = false
  public style: Style = {
    left: 0,
    top: 0
  }
  public view!: MenuView[]
  public buttons!: ContextButton[]
  public contrast: boolean = false

  get transitionName(): string {
    return this.contrast
      ? 'bgcb__dropdown-trans-bottom'
      : 'bgcb__dropdown-trans'
  }

  toggleVisible() {
    this.visible = !this.visible
  }

  mouseDownListener(event: Event) {
    let el: any = event.target
    const menuBox = getElementsByClassName('bgcb-contextmenu')

    // 用while向上循环节点找到menuBox的类，并赋值
    while (!menuBox.find((menu) => menu === el) && el.parentElement) {
      el = el.parentElement
    }
    if (!menuBox.find((m) => m === el)) {
      this.destroy()
    }
  }

  mouseClickListener(event: Event) {
    this.destroy()
  }

  itemClick(item: any) {
    if (!this.visible) {
      return
    }
    if (item && typeof item.onClick === 'function') {
      item.onClick(this.view)
      return this.destroy()
    }
  }

  destroy() {
    this.$emit('destroy')
    this.$destroy()
    //@ts-ignore
    this.$el.parentNode.removeChild(this.$el)
  }

  async mounted() {
    document.addEventListener('mousedown', this.mouseDownListener)
    document.addEventListener('click', this.mouseClickListener)
    await this.$nextTick()
    this.$emit('mounted')
  }

  beforeDestroy() {
    document.removeEventListener('mousedown', this.mouseDownListener)
    document.removeEventListener('click', this.mouseClickListener)
  }
}
</script>

<style lang="less" scoped>
.bgcb-contextmenu {
  position: absolute;
  z-index: 9999;
  max-width: 450px;
  background: #fff;
  line-height: 30px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.23), 0 0px 5px rgba(0, 0, 0, 0.03);
  border-radius: 3px;
  color: #333;
  &:before {
    position: absolute;
    top: -4px;
    left: 6px;
    border-right: 5px solid transparent;
    border-bottom: 5px solid #fff;
    border-left: 5px solid transparent;
    content: '';
  }
  &.contrast {
    &::before {
      display: none;
    }
    &::after {
      position: absolute;
      bottom: -4px;
      left: 6px;
      border-right: 5px solid transparent;
      border-top: 5px solid #fff;
      border-left: 5px solid transparent;
      content: '';
    }
  }
  &-item {
    padding: 0 15px 0 10px;
    list-style: none;
    font-size: 13px;
    &:hover {
      background: #f5f5f5;
      cursor: pointer;
    }
    i {
      display: inline-block;
      width: 13px;
      height: 13px;
      font-weight: bold;
      margin-right: 5px;
      &.fa {
        font-size: 12px;
        font-weight: normal;
      }
    }
  }
}

.bgcb__dropdown {
  overflow: hidden;
  position: absolute;
  width: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  margin: 5px 0 0;
}
.bgcb__dropdown-trans-enter-active,
.bgcb__dropdown-trans-leave-active {
  opacity: 1;
  transform: scaleY(1);
  transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1),
    opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
  transform-origin: center top;
}
.bgcb__dropdown-trans-enter,
.bgcb__dropdown-trans-leave-active {
  opacity: 0;
  transform: scaleY(0);
}

.bgcb__dropdown-trans-bottom-enter-active,
.bgcb__dropdown-trans-bottom-leave-active {
  opacity: 1;
  transform: scaleY(1);
  transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1),
    opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
  transform-origin: center bottom;
}
.bgcb__dropdown-trans-bottom-enter,
.bgcb__dropdown-trans-bottom-leave-active {
  opacity: 0;
  transform: scaleY(0);
}
</style>
