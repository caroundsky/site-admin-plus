<template>
  <el-dropdown-item :icon="ChinaIcon" @click="setLocale('zh-CN')">
    简体中文
  </el-dropdown-item>
  <el-dropdown-item :icon="AmericaIcon" @click="setLocale('en-US')">
    English
  </el-dropdown-item>
  <el-dropdown-item :icon="UpdateIcon" @click="updateMenu">
    {{ $t('更新菜单') }}
  </el-dropdown-item>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import ChinaIcon from './svg-icons/china.svg'
import AmericaIcon from './svg-icons/america.svg'
import UpdateIcon from './svg-icons/update.svg'

import MenuData from '../../mock/menu'
import { useI18nStore } from '../i18n/storeModule'
import bus from '@/bus'

const i18nStore = useI18nStore()

const setLocale = (local: string) => {
  i18nStore.setLocale(local)
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
