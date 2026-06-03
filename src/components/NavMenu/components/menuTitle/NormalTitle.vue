<script lang="tsx" setup>
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

<template>
  <div
    :class="[
      'bg-submenu__title',
      { 'set-dot': ifReplace },
      { 'is-new': menu.isNew },
    ]"
    :title="asideMenuOpen ? menu.text : ''"
  >
    <i :class="['bg-submenu__title-icon', menu.icon || 'fa fa-file-text-o']" />
    <span class="bg-submenu__title-txt" v-html="replaceHtml" />
    <i v-if="hasChildren" class="bg-submenu__title-arrow el-icon-arrow-down" />
  </div>
</template>
