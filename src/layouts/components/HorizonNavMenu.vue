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

<script setup lang="ts">
import { computed } from 'vue'

import NavMenuSearch from '@/components/NavMenuSearch.vue'
import NavMenu from '@/components/NavMenu/index.vue'
import AppActionBar from '@/layouts/components/AppActionBar.vue'
import Logo from '@/components/Logo.vue'
import bus from '@/bus'

const navMenuConfig = computed(() => {
  return bus.config.navMenu || {}
})
</script>

<style lang="scss">
.nav-menu--horizon {
  position: relative;
  display: flex;
  /* 主题色由 body.theme-* 提供（见 src/styles/themes.scss） */
  background: var(--site-color-nav);

  .menu__logo {
    box-shadow: 1px 0 4px 0 rgba(0, 0, 0, 0.2);
  }

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

    .lemon-dropdown {
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
