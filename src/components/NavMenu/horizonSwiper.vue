<template>
  <div ref="rootEl" class="horizon-swiper">
    <div
      class="horizon-swiper-btn icon-prev"
      :style="{ opacity: slidePrevHide ? 0 : 1 }"
      @click="slidePrev"
    >
      <el-icon><ArrowLeft /></el-icon>
    </div>
    <div class="horizon-swiper-warp">
      <div
        ref="swiper"
        class="horizon-swiper-container"
        :style="{
          width: `${calcWidth}px`,
          transform: `translateX(${translateX}px)`,
        }"
      >
        <slot />
      </div>
    </div>
    <div
      class="horizon-swiper-btn icon-next"
      :style="{ opacity: slideNextHide ? 0 : 1 }"
      @click="slideNext"
    >
      <el-icon><ArrowRight /></el-icon>
    </div>
  </div>
</template>

<script lang="tsx" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import debounce from 'lodash/debounce'

interface Props {
  horizon?: boolean
}

defineProps<Props>()

const rootEl = ref<HTMLElement | null>(null)
const swiper = ref<HTMLElement | null>(null)
const calcWidth = ref(0)
const swiperWidth = ref(0)
const translateX = ref(0)
const swiperIndex = ref(0)
const swiperIndexMax = ref(1)

// 按钮显隐直接由滑动位置推导，不依赖 watch 链（旧版 watch 丢失 immediate
// 会导致初始状态错误，且值不变时 watch 不触发，resize 后状态错乱）
const slidePrevHide = computed(() => swiperIndex.value === 0)
const slideNextHide = computed(() => swiperIndex.value >= swiperIndexMax.value)

// 宽度由 CSS（width: 100%）撑满父容器，JS 只量取渲染后的实际宽度用于滑动计算，
// 无需关心 logo / #horizon-operat / 视窗各自占了多宽
const update = () => {
  if (!rootEl.value) return
  swiperWidth.value = rootEl.value.getBoundingClientRect().width

  if (!swiper.value) return

  const swiperItems = swiper.value.getElementsByClassName('nav-menu__item-lv1')

  let width = 0
  for (const ele of swiperItems) {
    width += (ele as HTMLElement).getBoundingClientRect().width
  }
  calcWidth.value = width

  const result = Math.ceil(
    (calcWidth.value - swiperWidth.value + 60 - 15) / 200,
  )
  swiperIndexMax.value = result < 0 ? 0 : result
}

const slidePrev = () => {
  if (slidePrevHide.value) return
  swiperIndex.value > 0 ? swiperIndex.value-- : 0
  translateX.value = -200 * swiperIndex.value
}

const slideNext = () => {
  if (slideNextHide.value) return
  swiperIndex.value >= 0 ? swiperIndex.value++ : 0
  calcSwiperIndex(false)
}

const calcSwiperIndex = (checkZero: boolean = true) => {
  if (swiperIndex.value >= swiperIndexMax.value) {
    swiperIndex.value = swiperIndexMax.value
    translateX.value = -(calcWidth.value - (swiperWidth.value - 60))
  } else {
    translateX.value = -200 * swiperIndex.value
  }

  if (!checkZero) return
  if (swiperIndexMax.value === 0 && swiperIndex.value === 0) {
    translateX.value = 0
  }
}

// 菜单数据异步到达 / 显隐切换后，slot 内容变化时重新计算
let observer: MutationObserver | null = null
// 观察根元素自身尺寸：视窗 resize、父级 maxWidth 变化、#horizon-operat 宽度变化
// （如 username 异步到达）最终都会反映到根元素宽度上，无需逐个跟踪诱因
let sizeObserver: ResizeObserver | null = null

const handleResize = debounce(() => {
  update()
  calcSwiperIndex()
}, 200)

onMounted(() => {
  update()
  calcSwiperIndex()

  if (swiper.value) {
    observer = new MutationObserver(handleResize)
    observer.observe(swiper.value, { childList: true, subtree: true })
  }

  if (rootEl.value) {
    sizeObserver = new ResizeObserver(handleResize)
    sizeObserver.observe(rootEl.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
  sizeObserver?.disconnect()
})
</script>

<style lang="less" scoped>
.horizon-swiper {
  display: inline-block;
  width: 100%;
  &-container {
    transition-duration: 300ms;
    min-width: 100%;
  }
  & > div {
    display: inline-block;
    vertical-align: middle;
    height: @menu-view-bar-height;
  }

  &-warp {
    width: calc(100% - 60px);
    overflow: hidden;
  }
  &-btn {
    width: 30px;
    line-height: 45px;
    text-align: center;
    color: white;
    cursor: pointer;
  }
}
</style>
