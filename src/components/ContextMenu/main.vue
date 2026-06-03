<!--
 * 右键菜单
-->
<template>
  <transition :name="transitionName">
    <div
      v-show="visible"
      :class="['bgcb-contextmenu', { contrast }]"
      :style="position"
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

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getElementsByClassName } from '@/utils/tools'
import type { MenuView, ContextButton } from '~/types/interfaces'

interface Props {
  view?: MenuView[]
  buttons?: ContextButton[]
  position?: { left: string; top: string }
}

const props = withDefaults(defineProps<Props>(), {
  view: () => [],
  buttons: () => [],
  position: () => ({ left: '0px', top: '0px' }),
})

const emit = defineEmits<{
  destroy: []
  mounted: []
}>()

const visible = ref(false)
const contrast = ref(false)

const transitionName = computed(() => {
  return contrast.value ? 'bgcb__dropdown-trans-bottom' : 'bgcb__dropdown-trans'
})

const mouseDownListener = (event: Event) => {
  let el: any = event.target
  const menuBox = getElementsByClassName('bgcb-contextmenu')

  while (!menuBox.find((menu) => menu === el) && el.parentElement) {
    el = el.parentElement
  }
  if (!menuBox.find((m) => m === el)) {
    destroy()
  }
}

const mouseClickListener = () => {
  destroy()
}

const itemClick = (item: any) => {
  if (!visible.value) {
    return
  }
  if (item && typeof item.onClick === 'function') {
    item.onClick(props.view)
    return destroy()
  }
}

const destroy = () => {
  emit('destroy')
  visible.value = false
}

onMounted(async () => {
  document.addEventListener('mousedown', mouseDownListener)
  document.addEventListener('click', mouseClickListener)
  // 显示菜单
  visible.value = true
  await new Promise((resolve) => setTimeout(resolve, 0))
  emit('mounted')
})

onUnmounted(() => {
  document.removeEventListener('mousedown', mouseDownListener)
  document.removeEventListener('click', mouseClickListener)
})
</script>

<style lang="less" scoped>
.bgcb-contextmenu {
  position: absolute;
  z-index: 9999;
  max-width: 450px;
  background: #fff;
  line-height: 30px;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.23),
    0 0px 5px rgba(0, 0, 0, 0.03);
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
  transition:
    transform 300ms cubic-bezier(0.23, 1, 0.32, 1),
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
  transition:
    transform 300ms cubic-bezier(0.23, 1, 0.32, 1),
    opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
  transform-origin: center bottom;
}
.bgcb__dropdown-trans-bottom-enter,
.bgcb__dropdown-trans-bottom-leave-active {
  opacity: 0;
  transform: scaleY(0);
}
</style>
