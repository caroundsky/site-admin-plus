<template>
  <el-dropdown-item @click.native="setLocale('zh-CN')">
    <ChinaIcon class="icon" />
    简体中文
  </el-dropdown-item>
  <el-dropdown-item @click.native="setLocale('en-US')">
    <AmericaIcon class="icon" />
    English
  </el-dropdown-item>
  <el-dropdown-item @click.native="updateMenu">
    <UpdateIcon class="icon" />
    {{ $t('更新菜单') }}
  </el-dropdown-item>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { ElMessage } from 'element-plus'
import ChinaIcon from './svg-icons/china.svg'
import AmericaIcon from './svg-icons/america.svg'
import UpdateIcon from './svg-icons/update.svg'

import MenuData from '../../mock/menu'
import { useUserStore } from './storeModule'
import bus from '@/bus'

const userStore = useUserStore()

const setLocale = (local: string) => {
  // i18n store 需要单独处理
  // userStore.setLocale(local)
  console.log('setLocale', local)
}

const updateMenu = async () => {
  let Msg = ElMessage({
    message: '菜单更新中',
    duration: 0,
  })
  try {
    const res = await new Promise((resolve) =>
      setTimeout(() => resolve(MenuData), 1000),
    )
    // @ts-ignore
    bus.emit('setMenus', res.data)

    Msg.close()
    ElMessage.success('菜单更新成功')
  } catch (err) {
    ElMessage.error(`更新失败！${err}，请重试`)
    Msg.close()
  }
}
</script>
