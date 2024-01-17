<template>
  <fragment>
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
  </fragment>
</template>

<script lang="ts">
import Vue from 'vue'
import { Message } from 'element-ui'
import ChinaIcon from './svg-icons/china.svg'
import AmericaIcon from './svg-icons/america.svg'
import UpdateIcon from './svg-icons/update.svg'

import MenuData from '../../mock/menu'

export default Vue.extend({
  name: 'user-dropdown',

  inject: ['bus'],

  components: {
    ChinaIcon,
    AmericaIcon,
    UpdateIcon,
  },

  mounted() {},

  methods: {
    setLocale(local: string) {
      this.$store.dispatch('i18n/setLocale', local)
    },
    // 更新菜单
    async updateMenu() {
      let Msg = Message({
        message: '菜单更新中21',
        duration: 0,
      })
      try {
        // TIPS: 此处相关逻辑与 index.ts create 内逻辑一致，
        // 菜单相关逻辑以插件机制实现，此处可以按情况提取公共方法。
        const res = await new Promise((resolve) =>
          setTimeout(() => resolve(MenuData), 1000)
        )
        // @ts-ignore
        this.bus.$emit('setMenus', res.data)

        Msg.close()
        this.$store.dispatch('app/updateMenuKey')
        this.$store.dispatch('menuViews/updateAllViews')
        Message.success('菜单更新成功')
      } catch (err) {
        Message.error(`更新失败！${err}，请重试`)
        Msg.close()
      }
    },
  },
})
</script>
