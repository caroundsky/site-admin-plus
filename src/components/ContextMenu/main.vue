<!--
 * 右键菜单
-->
<template>
  <transition :name="transitionName">
    <div
      v-show="state.visible"
      :class="['bgcb-contextmenu', { contrast: state.contrast }]"
      :style="{ left: `${state.style.left}px`, top: `${state.style.top}px` }"
      @mouseleave="destroy"
    >
      <li
        class="bgcb-contextmenu-item"
        v-for="(item, index) in buttons"
        :key="index"
        @click="itemClick(item)"
      >
        <template v-if="item.icon">
          <el-icon v-if="typeof item.icon !== 'string'">
            <component :is="item.icon" />
          </el-icon>
          <i v-else :class="item.icon" />
        </template>
        <span>{{ item.label }}</span>
      </li>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElIcon } from 'element-plus'
import { getElementsByClassName } from '@/utils/tools'
import type { MenuView, ContextButton } from '~/types/interfaces'

interface Props {
  view?: MenuView | MenuView[]
  buttons?: ContextButton[]
}

const props = withDefaults(defineProps<Props>(), {
  buttons: () => [],
})

const emit = defineEmits<{
  destroy: []
  mounted: []
}>()

// 与旧版实例属性一一对应（visible / style / contrast），
// 挂载后由 index.ts 直接读写（对应旧版 instance.xxx = xxx）
const state = reactive({
  visible: false,
  style: {
    left: 0,
    top: 0,
  },
  contrast: false,
})

const transitionName = computed(() => {
  return state.contrast ? 'bgcb__dropdown-trans-bottom' : 'bgcb__dropdown-trans'
})

const mouseDownListener = (event: Event) => {
  let el: any = event.target
  const menuBox = getElementsByClassName('bgcb-contextmenu')

  // 用while向上循环节点找到menuBox的类，并赋值
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
  if (!state.visible) {
    return
  }
  if (item && typeof item.onClick === 'function') {
    item.onClick(props.view)
    return destroy()
  }
}

// 对应旧版的 destroy：emit('destroy') + $destroy + 移除 DOM。
// Vue 3 没有 $destroy，卸载与 DOM 移除由 index.ts 在 destroy 回调中完成
const destroy = () => {
  emit('destroy')
  state.visible = false
}

onMounted(async () => {
  document.addEventListener('mousedown', mouseDownListener)
  document.addEventListener('click', mouseClickListener)
  await nextTick()
  emit('mounted')
})

onUnmounted(() => {
  document.removeEventListener('mousedown', mouseDownListener)
  document.removeEventListener('click', mouseClickListener)
})

defineExpose({ state })
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
      height: 15px;
      vertical-align: middle;
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
.bgcb__dropdown-trans-enter-from,
.bgcb__dropdown-trans-leave-to {
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
.bgcb__dropdown-trans-bottom-enter-from,
.bgcb__dropdown-trans-bottom-leave-to {
  opacity: 0;
  transform: scaleY(0);
}
</style>
