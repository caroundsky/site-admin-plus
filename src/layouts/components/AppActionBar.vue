<!--
 * 头像等操作栏
-->
<template>
  <div
    :class="{
      'app-act': true,
      'app-act--invert': !isAsideMenu,
    }"
  >
    <div class="app-act__item">
      <el-dropdown
        trigger="click"
        placement="bottom"
        style="vertical-align: top"
      >
        <span class="user-act">
          <span class="avatar">
            <img :src="avatar || defaultAvatar" />
          </span>
          <span class="name">{{ username }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="user-act__popover">
            <div>
              <PluginSlot name="user-dropdown" />
            </div>
            <el-dropdown-item :icon="LogoutIcon" @click="logOut">
              {{ $t('退出登录') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <PluginSlot name="action-bar-addon" />

    <div class="app-act__item">
      <el-popover
        placement="bottom-end"
        :width="200"
        trigger="click"
        :key="isAsideMenu"
      >
        <template #reference>
          <div class="app-act__link sys-act" title="设置">
            <el-icon><Setting /></el-icon>
          </div>
        </template>
        <div class="sys-field" v-if="showSwitch">
          <span class="sys-field__label">水平式导航</span>
          <el-switch :model-value="!isAsideMenu" @click="toggleNavMenuLayout" />
        </div>

        <PluginSlot name="sys-dropdown" />
      </el-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'

import bus from '@/bus'
import LogoutIcon from '@/assets/svg-icons/logout.svg'
import defaultAvatar from '@/assets/default-avatar.jpg'

const appStore = useAppStore()

const isAsideMenu = computed(() => appStore.isAsideMenu)

const avatar = computed(() => bus.getState('avatar'))
const username = computed(() => bus.getState('username'))

const showSwitch = computed(() => {
  return !bus.config.navMenu?.disableLayoutSwitch
})

const toggleNavMenuLayout = () => {
  appStore.toggleNavMenuLayout()
}

const logOut = () => {
  bus.emit('logout')
}
</script>

<style lang="less" scoped>
.app-act {
  display: flex;
  height: 100%;
  border-left: 1px solid rgba(0, 0, 0, 0.1);

  :deep(> *) {
    display: inline-block;
    height: 100%;
    vertical-align: top;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  :deep(&__item) {
    color: #333;
  }

  :deep(&__link) {
    position: relative;
    color: #333;
    cursor: pointer;
    padding: 0;
    width: @menu-view-bar-height + 6px;
  }

  &__notice {
    position: absolute;
    right: -3px;
    top: 0;
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    background: #f00;
    color: #fff;
    font-size: 12px;
    border-radius: 50%;
  }

  &--invert > div {
    background-color: transparent;
    color: #fff;
  }
}

.user-act {
  display: flex;
  height: @menu-view-bar-height;
  align-items: center;
  cursor: pointer;
  padding: 0 10px;

  .avatar {
    display: block;
    padding-right: 5px;

    img {
      width: @menu-view-bar-height - 10px;
      height: @menu-view-bar-height - 10px;
      vertical-align: top;
      border-radius: 50%;
    }
  }

  .name:not(:empty) {
    padding-left: 5px;
  }

  &__popover {
    .svg-icon {
      margin-right: 0.2em;
    }
  }
}

.sys-act {
  display: flex;
  height: @menu-view-bar-height;
  width: @menu-view-bar-height + 6px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.sys-field {
  &__label {
    padding-right: 1em;
    font-size: 14px;
    color: #666;
  }
}
</style>
