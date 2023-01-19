<!--
 * 垂直侧边菜单栏
-->
<template>
  <div
    :class="[
      'aside-nav-menu',
      {
        'aside-nav-menu--open': menuOpen,
        'aside-nav-menu--close': !menuOpen,
      },
    ]"
  >
    <!-- logo -->
    <Logo class="aside-nav-menu__logo" :small="!menuOpen" />

    <!-- 搜索器 -->
    <div class="aside-nav-menu__search" v-if="navMenuConfig.search">
      <NavMenuSearch />
    </div>

    <!-- 菜单列表 -->
    <div class="aside-nav-menu__main">
      <elScrollbar class="scroller">
        <NavMenu
          :popover-level="popoverLevel"
          :unique-opened="navMenuConfig.uniqueOpened"
        />
      </elScrollbar>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import NavMenuSearch from '@/components/NavMenuSearch.vue'
import NavMenu from '@/components/NavMenu/index.vue'
import Logo from '@/components/Logo.vue'
import bus from '@/bus'

const AppModule = namespace('app')

@Component({
  components: {
    NavMenuSearch,
    NavMenu,
    Logo,
  },
})
export default class AsideNavMenu extends Vue {
  @AppModule.State('isAsideMenuOpen')
  public menuOpen!: boolean

  get navMenuConfig() {
    return bus.config.navMenu || {}
  }

  get popoverLevel() {
    if (this.menuOpen) {
      return this.navMenuConfig.popoverLevel
    }

    return 1
  }
}
</script>

<style lang="less">
.aside-nav-menu {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: @sidebar-text-color;
  background-color: @sidebar-background-color;
  transition: width 0.2s, background 0.2s;

  a {
    color: @sidebar-text-color;
    text-decoration: none;
  }

  &__search {
    padding: 8px;
  }

  &__main {
    flex: 1;
    overflow: hidden;
  }
}

// element-ui overwrite
.scroller {
  height: 100%;
  & > div {
    right: 0px;
    padding-right: 2px;
    overflow-x: hidden;
  }
}
</style>
