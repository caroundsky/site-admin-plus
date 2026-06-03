<script lang="tsx" setup>
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

const helpDocument = (e: Event, url: string) => {
  e.stopPropagation()
  window.open(url)
}
</script>

<template>
  <span :class="['bg-submenu__title-txt', { 'is-new': menu.isNew }]">
    <span v-html="replaceHtml" />
    <i
      v-if="menu.help && menu.helpUrl"
      class="help-icon fa fa-question-circle-o"
      title="帮助"
      @click="(e: Event) => helpDocument(e, menu.helpUrl)"
    />
  </span>
</template>
