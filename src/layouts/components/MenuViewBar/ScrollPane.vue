<template>
  <el-scrollbar
    ref="scrollContainerRef"
    class="scroll-container"
    @wheel.prevent="handleScroll"
  >
    <slot />
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

const scrollContainerRef = ref<any>(null)

const scrollWrapper = computed(() => {
  return scrollContainerRef.value?.wrap
})

const handleScroll = (e: WheelEvent) => {
  const eventDelta = (e as any).wheelDelta || -e.deltaY * 40
  const $scrollWrapper = scrollWrapper.value
  if ($scrollWrapper) {
    $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft - eventDelta / 4
  }
}

const moveToTarget = async (currentTag: string, tagList: any[]) => {
  await nextTick()

  const $container = scrollContainerRef.value?.$el
  if (!$container || !tagList || tagList.length === 0) return

  const $containerWidth = $container.offsetWidth
  const $scrollWrapper = scrollWrapper.value
  if (!$scrollWrapper) return

  let firstTag = null
  let lastTag = null

  if (tagList.length > 0) {
    firstTag = tagList[0].title
    lastTag = tagList[tagList.length - 1].title
  }

  if (firstTag === currentTag) {
    $scrollWrapper.scrollLeft = 0
  } else if (lastTag === currentTag) {
    $scrollWrapper.scrollLeft = $scrollWrapper.scrollWidth - $containerWidth
  } else {
    const currentIndex = tagList.findIndex(
      (item: any) => item.title === currentTag,
    )

    if (currentIndex === -1) return

    const prevTag = tagList[currentIndex - 1]
    const nextTag = tagList[currentIndex + 1]
    const nextEl = nextTag?.$el || nextTag
    const prevEl = prevTag?.$el || prevTag

    if (nextEl) {
      const afterNextTagOffsetLeft = nextEl.offsetLeft + nextEl.offsetWidth
      if (
        afterNextTagOffsetLeft >
        $scrollWrapper.scrollLeft + $containerWidth
      ) {
        $scrollWrapper.scrollLeft = afterNextTagOffsetLeft - $containerWidth
      }
    }

    if (prevEl) {
      const beforePrevTagOffsetLeft = prevEl.offsetLeft
      if (beforePrevTagOffsetLeft < $scrollWrapper.scrollLeft) {
        $scrollWrapper.scrollLeft = beforePrevTagOffsetLeft
      }
    }
  }
}

defineExpose({
  moveToTarget,
})
</script>

<style lang="less" scoped>
.scroll-container {
  :deep(.el-scrollbar__bar.is-horizontal) {
    bottom: 0;
  }
  :deep(.el-scrollbar__bar.is-vertical) {
    display: none;
  }
  :deep(.el-scrollbar__wrap) {
    height: 50px;
  }
}
</style>
