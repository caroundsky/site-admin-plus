<!--
 * 顶部菜单栏目
 1、 侧边栏收回按钮
 2、 当前栏目标签
 3、 用户信息以及部门操作按钮
-->
<template>
  <FlexContainer
    :class="['menu-view-bar', { 'menu-view-bar__vertical': !isAsideMenu }]"
  >
    <div class="sidebar-folder" @click="sidebarClick" v-show="isAsideMenu">
      <HambergerArrow :arrow="!isAsideMenuOpen" />
    </div>

    <FlexMain>
      <MenuViews />
    </FlexMain>

    <div class="right-act" v-show="isAsideMenu">
      <AppActionBar />
    </div>
  </FlexContainer>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import HambergerArrow from '@/components/HambergerArrow.vue'
import AppActionBar from '@/layouts/components/AppActionBar.vue'
import MenuViews from './MenuViews.vue'

const AppModule = namespace('app')

@Component({
  components: {
    HambergerArrow,
    AppActionBar,
    MenuViews,
  },
})
export default class MenuViewBar extends Vue {
  @AppModule.State('isAsideMenu')
  public isAsideMenu!: boolean

  @AppModule.State('isAsideMenuOpen')
  public isAsideMenuOpen!: boolean

  @AppModule.Action('toggleSideMenu')
  public toggleSideMenu!: () => void

  @AppModule.Action('userSet')
  public userSet!: () => void

  sidebarClick() {
    this.userSet()
    this.toggleSideMenu()
  }
}
</script>

<style lang="less" scoped>
.menu-view-bar {
  height: @menu-view-bar-height;
  border-bottom: 1px solid #e1e1e1;
  box-shadow: 0 0 10px #ddd;
  box-sizing: border-box;

  .sidebar-folder {
    padding: 0 2px;
    position: relative;
    width: @menu-view-bar-height;
    cursor: pointer;

    &:hover {
      background-color: rgba(0, 0, 0, 0.06);
    }

    .hamburger {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}

.menu-view-bar__vertical {
  height: @menu-view-bar-height - 4px;
  padding-top: 5px;
  padding-left: 20px;
}
</style>
