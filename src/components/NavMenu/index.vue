<!--
 * menu
-->
<script lang="tsx" setup>
import {
  ref,
  computed,
  watch,
  provide,
  onMounted,
  onUnmounted,
  nextTick,
  useAttrs,
} from 'vue'
import { useAppStore } from '@/stores/app'
import { useMenuStore } from '@/stores/menu'
import { useMenuViewsStore } from '@/stores/menuViews'
import type { NavMenuItem } from '~/types/interfaces'

import SubMenu from './subMenu.vue'
import MenuItem from './menuItem.vue'
import HorizonSwiper from './horizonSwiper.vue'
import MenuTitle from './components/menuTitle/index.vue'

import debounce from 'lodash/debounce'
import highlight from '@/utils/highlight'
import { TRIGGLE_ASIDE } from '@/constants'

import bus from '@/bus'

interface Props {
  popoverLevel?: number
  uniqueOpened?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  popoverLevel: 1,
  uniqueOpened: true,
})

const attrs = useAttrs()
const appStore = useAppStore()
const menuStore = useMenuStore()
const menuViewsStore = useMenuViewsStore()

const appInited = computed(() => appStore.isInited)
const asideMenuOpen = computed(() => appStore.isAsideMenuOpen)
const menuKey = computed(() => appStore.menuKey)
const isUserSet = computed(() => appStore.isUserSet)
const menuData = computed(() => menuStore.navMenu)
const navMenuMode = computed(() => menuStore.navMenuMode)
const searchKeyword = computed(() => menuStore.searchKeyword)
const menuSearchPY = computed(() => menuStore.menuSearchPY)
const menuSearchPYids = computed(() => menuStore.menuSearchPYids)

const isHorizon = computed(() => attrs.horizon !== undefined)

const openedMenus = ref<string[]>([])
const horizonPopMaxH = ref(0)
const horizonNavMaxW = ref(324)

const DEFAULT_POPOVER_HEIGHT_RATIO = 0.8

const navMenuConfig = computed(() => {
  return bus.config.navMenu || {}
})

// 提供响应式的 rootMenu
const rootMenu = ref<any>({})
provide('rootMenu', rootMenu)

// 初始化 rootMenu
rootMenu.value = {
  popoverLevel: props.popoverLevel,
  asideMenuOpen: asideMenuOpen.value,
  horizon: isHorizon.value,
  menuSearchPY: menuSearchPY.value,
  openedMenus: openedMenus.value,
  horizonPopMaxH: horizonPopMaxH.value,
  popoverColumnMaxWidth: navMenuConfig.value.popoverColumnMaxWidth || 240,
}

// 监听 appInited 变化
watch(appInited, (val) => {
  if (val && isHorizon.value) {
    horizonNavMaxW.value = 324
  }
})

// 监听自身变化更新 rootMenu
watch(
  [asideMenuOpen, () => props.popoverLevel, menuSearchPY, horizonPopMaxH],
  () => {
    rootMenu.value = {
      popoverLevel: props.popoverLevel,
      asideMenuOpen: asideMenuOpen.value,
      horizon: isHorizon.value,
      menuSearchPY: menuSearchPY.value,
      openedMenus: openedMenus.value,
      horizonPopMaxH: horizonPopMaxH.value,
      popoverColumnMaxWidth: navMenuConfig.value.popoverColumnMaxWidth || 240,
    }
  },
)

// 渲染菜单项
const renderMenuItem = (menu: NavMenuItem, level: number = 1) => {
  const hasChildren = Array.isArray(menu.children) && menu.children.length > 0

  if (!menu.show) return null
  if (level === 1 && !navMenuMode.value[menu.id]) return null

  const { ifReplace, replaceHtml } = highlight(
    menu.text,
    menuSearchPY.value,
    'object',
  )
  const shouldHighlight =
    ifReplace || menuSearchPYids.value.indexOf(menu.id) !== -1

  const key = menu.id + shouldHighlight + searchKeyword.value

  const _menuTitle = (
    <MenuTitle
      menu={menu}
      level={level}
      hasChildren={hasChildren}
      ifReplace={shouldHighlight}
      replaceHtml={replaceHtml}
    />
  )

  if (hasChildren) {
    return (
      <SubMenu
        key={key}
        menuData={menu}
        level={level}
        hasChildren={hasChildren}
        v-slots={{
          title: () => _menuTitle,
          default: () =>
            menu.children!.map((child) => renderMenuItem(child, level + 1)),
        }}
      />
    )
  } else {
    return (
      <MenuItem
        key={key}
        menuData={menu}
        level={level}
        v-slots={{ default: () => _menuTitle }}
      />
    )
  }
}

// 事件处理
const handleSubmenuClick = (submenu: any) => {
  const { index, indexPath } = submenu
  const isOpened = openedMenus.value.indexOf(index) !== -1
  if (isOpened) {
    closeMenu(index)
  } else {
    openMenu(index, indexPath)
  }
}

const closeMenu = (index: string) => {
  const i = openedMenus.value.indexOf(index)
  if (i !== -1) {
    openedMenus.value.splice(i, 1)
  }
}

const openMenu = (index: string, indexPath: string[]) => {
  if (openedMenus.value.indexOf(index) !== -1) return
  if (props.uniqueOpened) {
    // 从后往前 splice，保持数组引用不变，避免 rootMenu.value.openedMenus 与 openedMenus.value 脱钩
    for (let i = openedMenus.value.length - 1; i >= 0; i--) {
      if (indexPath.indexOf(openedMenus.value[i]) === -1) {
        openedMenus.value.splice(i, 1)
      }
    }
  }
  openedMenus.value.push(index)
}

const handleItemClick = (item: any) => {
  menuViewsStore.addView({
    id: item.id,
    text: item.text,
    href: item.href,
  })
}

// 监听事件
bus.on('subMenu-click', handleSubmenuClick)
bus.on('item-click', handleItemClick)

let listenerResize: any

onMounted(async () => {
  await nextTick()

  horizonPopMaxH.value =
    window.innerHeight *
    (navMenuConfig.value.popoverHeightRatio || DEFAULT_POPOVER_HEIGHT_RATIO)

  listenerResize = debounce(() => {
    horizonPopMaxH.value =
      window.innerHeight *
      (navMenuConfig.value.popoverHeightRatio || DEFAULT_POPOVER_HEIGHT_RATIO)

    const WW = window.innerWidth
    if (WW <= TRIGGLE_ASIDE && asideMenuOpen.value) {
      appStore.toggleSideMenu()
    }
    if (WW > TRIGGLE_ASIDE && !asideMenuOpen.value && !isUserSet.value) {
      appStore.toggleSideMenu()
    }
  }, 200)

  window.addEventListener('resize', listenerResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', listenerResize)
  bus.off('subMenu-click', handleSubmenuClick)
  bus.off('item-click', handleItemClick)
})
</script>

<template>
  <div
    :key="menuKey"
    :class="[
      'bg-nav-menu',
      {
        'bg-nav-menu--horizon': isHorizon,
        'bg-nav-menu--close': !asideMenuOpen,
        'bg-nav-menu--nosearch': !navMenuConfig.search,
      },
    ]"
    :style="
      isHorizon
        ? { maxWidth: `calc(100% - 50px - ${horizonNavMaxW}px)` }
        : undefined
    "
  >
    <HorizonSwiper v-if="isHorizon" class="bg-menu nav-menu__menu">
      <component
        v-for="menu in menuData"
        :is="renderMenuItem(menu)"
        :key="menu.id"
      />
    </HorizonSwiper>
    <ul v-else class="bg-menu nav-menu__menu">
      <component
        v-for="menu in menuData"
        :is="renderMenuItem(menu)"
        :key="menu.id"
      />
    </ul>
  </div>
</template>

<style lang="less">
@import './navMenu.less';
</style>
