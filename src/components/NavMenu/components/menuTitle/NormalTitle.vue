<template>
  <div
    :class="[
      'bg-submenu__title',
      { 'set-dot': ifReplace },
      { 'is-new': menu.isNew },
    ]"
    :title="asideMenuOpen ? menu.text : ''"
  >
    <el-icon v-if="!menu.icon" class="bg-submenu__title-icon">
      <Document />
    </el-icon>
    <i v-else :class="['bg-submenu__title-icon', menu.icon]" />
    <span class="bg-submenu__title-txt" v-html="replaceHtml" />
    <el-icon v-if="hasChildren" class="bg-submenu__title-arrow">
      <ArrowDown />
    </el-icon>
  </div>
</template>

<script lang="tsx" setup>
import { ArrowDown, Document } from '@element-plus/icons-vue'

import type { NavMenuItem } from '~/types/interfaces'

interface Props {
  menu: NavMenuItem
  replaceHtml?: string
  ifReplace?: boolean
  asideMenuOpen?: boolean
  hasChildren?: boolean
}

withDefaults(defineProps<Props>(), {
  replaceHtml: '',
  ifReplace: false,
  asideMenuOpen: true,
  hasChildren: false,
})
</script>
