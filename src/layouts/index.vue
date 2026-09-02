<template>
  <FlexContainer
    :vertical="!isAsideMenu"
    :class="[
      'site-container',
      {
        'site-container--menu-aside': isAsideMenu,
        'site-container--menu-open': isAsideMenu && isAsideMenuOpen,
        'site-container--menu-close': isAsideMenu && !isAsideMenuOpen,
        'site-container--menu-horizon': !isAsideMenu,
        [`site-container--theme-${theme}`]: theme,
      },
    ]"
  >
    <div class="site-container__aside">
      <AsideNavMenu
        v-if="isAsideMenu"
        :class="{ 'site-container__mask': isMenuMaskOpen }"
      />
    </div>

    <FlexMain>
      <FlexContainer
        :class="[
          'site-container__main',
          { 'site-container__mask': isMenuMaskOpen },
        ]"
        vertical
      >
        <HorizonNavMenu v-if="!isAsideMenu" />

        <MenuViewBar />

        <FlexMain class="flex-main__content">
          <MainContent />
        </FlexMain>

        <PluginSlot name="main-footer" />
      </FlexContainer>
    </FlexMain>

    <PluginSlot name="container-slot" />
  </FlexContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import bus from '@/bus'
import AsideNavMenu from '@/layouts/components/AsideNavMenu.vue'
import HorizonNavMenu from '@/layouts/components/HorizonNavMenu.vue'
import MenuViewBar from '@/layouts/components/MenuViewBar/index.vue'
import MainContent from '@/layouts/components/MainContent.vue'

const appStore = useAppStore()

const isAsideMenu = computed(() => appStore.isAsideMenu)
const isAsideMenuOpen = computed(() => appStore.isAsideMenuOpen)
const isMenuMaskOpen = computed(() => appStore.isMenuMaskOpen)

// 主题由主题插件通过 bus.setState('theme', ...) 同步
const theme = computed(() => bus.getState('theme') || 'default')
</script>

<style lang="less">
.site-container {
  height: 100%;
  width: 100%;
  background-color: #fff;
}

.site-container__aside {
  width: @aside-menu-width;
  transition: width ease 0.4s;
}

.site-container--menu-close {
  .site-container__aside {
    width: @aside-menu-close-width;
  }
  & > .flex-main {
    width: 80%;
  }
}

.site-container__main {
  overflow: hidden;
  height: 100%;
}

.site-container__mask {
  & > div:not(:first-child) {
    filter: blur(2px);
  }
  & > div:first-child > div:not(.menu__logo) {
    filter: blur(2px);
  }
}
</style>
