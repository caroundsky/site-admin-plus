<script lang="tsx" setup>
import { computed, inject } from 'vue'
import type { NavMenuItem } from '~/types/interfaces'
import NormalTitle from './NormalTitle.vue'
import PopoverTitle from './PopoverTitle.vue'

interface Props {
  menu: NavMenuItem
  level?: number
  hasChildren?: boolean
  ifReplace?: boolean
  replaceHtml?: string
}

withDefaults(defineProps<Props>(), {
  level: 1,
  hasChildren: false,
  ifReplace: false,
  replaceHtml: '',
})

const rootMenu = inject<any>('rootMenu')

const asideMenuOpen = computed(() => rootMenu?.value?.asideMenuOpen ?? true)
const popoverLevel = computed(() => rootMenu?.value?.popoverLevel ?? 1)
</script>

<template>
  <NormalTitle
    v-if="level <= popoverLevel"
    :menu="menu"
    :replace-html="replaceHtml"
    :if-replace="ifReplace"
    :aside-menu-open="asideMenuOpen"
    :has-children="hasChildren"
  />
  <PopoverTitle
    v-else
    :menu="menu"
    :replace-html="replaceHtml"
    :if-replace="ifReplace"
    :has-children="hasChildren"
  />
</template>
