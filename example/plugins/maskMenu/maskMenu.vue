<!--
 * menu遮罩层，提供菜单的显示/隐藏功能
-->
<template>
  <div
    :class="{ 'bgcb-menu-mask': true, 'bgcb-menu-mask__open': isMenuMaskOpen }"
  >
    <div class="bgcb-menu-mask-warpper" v-clickoutside:menu__logo="close">
      <i class="bgcb-menu-mask-close el-icon-close" @click="toggleMaskMenu" />

      <div class="bgcb-flex-between" style="margin-bottom: 10px">
        <h3>请根据您的需要进行选择，所选的系统同时显示在左侧主菜单中！</h3>
        <el-switch
          v-model="selectAll"
          active-color="#13ce66"
          inactive-color="rgb(177, 177, 177)"
          inactive-text="全选："
          @change="change"
        />
      </div>

      <ul class="bgcb-menu-mask-list">
        <li
          v-for="menu in filterMenuData"
          :key="menu.id"
          :class="{ 'has-checked': navMenuMode[menu.id] }"
          @click="menuClick(menu.id)"
        >
          <i :class="menu.icon || 'fa fa-file-text-o'" />
          <span>{{ menu.text }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { NavMenuItem } from '~/types/interfaces'

import Clickoutside from '@/utils/clickoutside'

const AppModule = namespace('app')
const MenuModule = namespace('menu')

interface navMenuMode {
  [key: string]: boolean
}

@Component({
  directives: { Clickoutside },
  inject: ['bus'],
  name: 'MaskMenu',
})
export default class MaskMenu extends Vue {
  @AppModule.State('isInited')
  public isInited!: boolean

  @AppModule.State('isMenuMaskOpen')
  public isMenuMaskOpen!: boolean

  @AppModule.Action('toggleMaskMenu')
  public toggleMaskMenu!: () => void

  @MenuModule.Action('toggleMenuShow')
  public toggleMenuShow!: (index: string | boolean) => void

  @MenuModule.State('navMenu')
  public menuData!: NavMenuItem[]

  @MenuModule.State('navMenuMode')
  public navMenuMode!: navMenuMode

  @Watch('navMenuMode', { deep: true })
  handleNavMenuMode(val: navMenuMode) {
    if (Object.values(val).some((key) => !key)) {
      this.selectAll = false
    } else {
      this.selectAll = true
    }
  }

  public selectAll: boolean = false
  public filterMenuData: NavMenuItem[] = []

  mounted() {
    /**
     * 菜单显示控制只需要显示一级菜单
     * 做一次过滤将一级菜单且show为true的筛选出来
     */
    this.bus.$on('setMenusCompelet', () => {
      this.filterMenuData = this.menuData.filter((item) => item.show)
    })

    this.bus.$on('logoClick', () => {
      this.$store.dispatch('app/toggleMaskMenu')
    })
  }

  close() {
    if (!this.isMenuMaskOpen) return
    this.toggleMaskMenu()
  }

  change(val: boolean) {
    this.toggleMenuShow(val)
  }

  menuClick(id: NavMenuItem['id']) {
    this.toggleMenuShow(id)
  }
}
</script>

<style lang="less" scoped>
.bgcb-menu-mask {
  visibility: hidden;
  box-sizing: border-box;

  position: absolute;
  z-index: 999;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  color: #fff;
  font-size: 14px;
  opacity: 0;
  background: rgba(0, 0, 0, 0.6);
  transition: ease 0.3s;

  h3 {
    margin: 0;
    font-weight: normal;
    font-size: 14px;
  }
  li,
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  & > div > * {
    opacity: 0;
    transition-property: opacity transform;
    transition-duration: 0.3s;
    transition-timing-function: ease;
    transform: translateY(10px);
  }

  &__open {
    visibility: visible;
    opacity: 1;
    & > div > * {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &-close {
    position: absolute;
    right: -40px;
    top: -45px;
    font-size: 36px;
    cursor: pointer;
    transition: transform ease 0.4s;
    transition-delay: 50ms;
    &:hover {
      transform: rotate(0.5turn);
    }
  }

  /deep/.el-switch__label {
    color: #fff;
  }
}

.bgcb-menu-mask-warpper {
  position: relative;
  width: 772px;
  padding: 20px 20px 0;
  margin-bottom: 12vh;
  margin-right: 8vw;
  & > div {
    transition-delay: 100ms;
  }
}

.bgcb-menu-mask-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 10px;
  transition-delay: 150ms;
  li {
    position: relative;
    width: 120px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.8);
    margin-top: 10px;
    cursor: pointer;

    // 令最后一排左对齐
    &:last-child:nth-child(6n - 1) {
      margin-right: calc(16% + 6% / 7);
    }
    &:last-child:nth-child(6n - 2) {
      margin-right: calc(32% + 12% / 7);
    }
    &:last-child:nth-child(6n - 3) {
      margin-right: calc(48% + 18% / 7);
    }
    &:last-child:nth-child(6n - 4) {
      margin-right: calc(64% + 25% / 7);
    }

    &:after {
      content: '';
      position: absolute;
      right: -3px;
      top: -11px;
      border-top: 17px solid transparent;
      border-bottom: 17px solid transparent;
      border-left: 17px solid #51a351;
      opacity: 0;
      transform: rotateZ(-45deg);
      transition: opacity 0.2s;
    }
    &:before {
      content: '\e6da';
      position: absolute;
      z-index: 1;
      right: 1px;
      top: 1px;
      color: #fff;
      font-size: 12px;
      font-weight: bolder;
      font-family: 'element-icons';
      transform: scale(0);
      transition: transform ease 0.2s;
    }

    &.has-checked {
      &:after {
        opacity: 1;
      }
      &:before {
        transform: none;
      }
    }

    i {
      // 处理没有图标时的情况
      display: inline-block;
      width: 30px;
      height: 30px;

      font-size: 30px;
      font-weight: 100;
      color: var(--theme-color);
    }
    span {
      display: inline-block;
      margin-top: 10px;
      color: #333;
    }
  }
}
</style>
