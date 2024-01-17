<!--
 * 横向菜单
-->
<template>
  <div class="nav-menu--horizon">
    <!-- logo -->
    <Logo class="nav-menu--horizon__logo" small />

    <NavMenu :popover-level="1" :unique-opened="true" horizon />

    <div
      ref="horizon-operat"
      id="horizon-operat"
      class="nav-menu--horizon-operat"
    >
      <!-- 搜索栏 -->
      <div class="nav-menu--horizon__search" v-if="navMenuConfig.search">
        <NavMenuSearch />
      </div>

      <div class="nav-menu--horizon__act">
        <AppActionBar />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

import NavMenuSearch from '@/components/NavMenuSearch.vue'
import NavMenu from '@/components/NavMenu/index.vue'
import AppActionBar from '@/layouts/components/AppActionBar.vue'
import Logo from '@/components/Logo.vue'
import bus from '@/bus'

@Component({
  name: 'HorizonNavMenu',
  components: {
    NavMenuSearch,
    NavMenu,
    AppActionBar,
    Logo,
  },
})
export default class HorizonNavMenu extends Vue {
  get navMenuConfig() {
    return bus.config.navMenu || {}
  }
}
</script>

<style lang="less">
.nav-menu--horizon {
  position: relative;
  .nav-menu-search {
    position: initial;
    &__icon {
      top: 4px;
    }
  }
  &__logo {
    width: 50px;
    float: left;
  }

  &-operat {
    position: relative;
    float: right;
  }
  &__act {
    display: inline-block;
    vertical-align: middle;

    .el-dropdown {
      color: #fff;
    }
    .app-act {
      border-left: 0;
      &__link {
        color: #fff;
        &:hover {
          color: #fff;
        }
      }
      & > * {
        height: initial;
      }
    }
  }
  &__search {
    display: inline-block;
    width: 32px;
    height: 32px;
    vertical-align: middle;
    margin-right: 10px;
  }
}
</style>
