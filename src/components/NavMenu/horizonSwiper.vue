<script lang="tsx" setup>
import { ref, watch, inject, onMounted } from 'vue'
import debounce from 'lodash/debounce'

interface Props {
  horizon?: boolean
}

defineProps<Props>()

const rootMenu = inject<any>('rootMenu')

const swiper = ref<HTMLElement | null>(null)
const calcWidth = ref(0)
const swiperWidth = ref(0)
const translateX = ref(0)
const swiperIndex = ref(0)
const swiperIndexMax = ref(1)
const slideNextHide = ref(false)
const slidePrevHide = ref(false)

watch(swiperIndex, (index) => {
  slideNextHide.value = index === swiperIndexMax.value && index !== 0
})

watch(swiperIndexMax, (max) => {
  if (max === 0 && swiperIndex.value === 0) {
    slideNextHide.value = true
  }
  if (max > swiperIndex.value) {
    slideNextHide.value = false
  }
})

watch(translateX, (val) => {
  slidePrevHide.value = val === 0
})

const update = () => {
  const horizonOperat = document.getElementById('horizon-operat')
  if (!horizonOperat) return

  const horizonOperatW = horizonOperat.getBoundingClientRect().width
  swiperWidth.value = window.innerWidth - horizonOperatW - 50

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
    slidePrevHide.value = true
    slideNextHide.value = true
    translateX.value = 0
  }
}

onMounted(() => {
  update()
  window.addEventListener(
    'resize',
    debounce(() => {
      if (rootMenu?.value && !rootMenu.value.isAsideMenu) {
        update()
        calcSwiperIndex()
      }
    }, 200),
  )
})
</script>

<template>
  <div class="horizon-swiper" :style="{ width: `${swiperWidth}px` }">
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

<style lang="less" scoped>
.horizon-swiper {
  display: inline-block;
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
    line-height: 40px;
    text-align: center;
    color: white;
    cursor: pointer;
  }
}
</style>
