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

<script lang="ts">
import { Vue, Component, Provide } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import AsideNavMenu from '@/layouts/components/AsideNavMenu.vue'
import HorizonNavMenu from '@/layouts/components/HorizonNavMenu.vue'
import MenuViewBar from '@/layouts/components/MenuViewBar/index.vue'
import MainContent from '@/layouts/components/MainContent.vue'

const AppModule = namespace('app')

@Component({
  name: 'MainContainer',
  components: {
    AsideNavMenu,
    HorizonNavMenu,
    MenuViewBar,
    MainContent,
  },
})
export default class MainContainer extends Vue {
  @AppModule.State('isAsideMenu')
  public isAsideMenu!: boolean

  @AppModule.State('isAsideMenuOpen')
  public isAsideMenuOpen!: boolean

  @AppModule.State('isMenuMaskOpen')
  public isMenuMaskOpen!: boolean

  get theme() {
    try {
      return this.$store.state.themes.currentTheme || 'default'
    } catch (error) {
      return 'default'
    }
  }
}
</script>

<style lang="less">
.site-container {
  height: 100%;
  width: 100%;
  background-color: #fff;
  // & > .flex-main {
  //   position: absolute;
  //   top: 0;
  //   right: 0;
  //   width: calc(100% - @aside-menu-width);
  //   height: 100%;
  // }
}

.site-container__aside {
  // position: absolute;
  // top: 0;
  // left: 0;
  // transform: translateZ(0);
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
