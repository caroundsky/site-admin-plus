<template>
  <span :class="['bg-submenu__title-txt', { 'is-new': menu.isNew }]">
    <span v-html="replaceHtml" />
    <el-icon
      v-if="menu.help && menu.helpUrl"
      class="help-icon"
      title="帮助"
      @click="(e: Event) => helpDocument(e, menu.helpUrl)"
    >
      <QuestionFilled />
    </el-icon>
  </span>
</template>

<script lang="tsx" setup>
import { QuestionFilled } from '@element-plus/icons-vue'

import type { NavMenuItem } from '~/types/interfaces'

interface Props {
  menu: NavMenuItem
  replaceHtml?: string
  ifReplace?: boolean
  hasChildren?: boolean
}

withDefaults(defineProps<Props>(), {
  replaceHtml: '',
  ifReplace: false,
  hasChildren: false,
})

const helpDocument = (e: Event, url?: string) => {
  e.stopPropagation()
  if (!url) return
  window.open(url)
}
</script>
