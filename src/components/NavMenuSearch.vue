<!--
* Menu搜索栏
-->
<template>
  <div
    :class="[
      'nav-menu-search',
      {
        'nav-menu-search--open': isOpen,
        'nav-menu-search--close': !isOpen,
        'nav-menu-search--horizon': !isAsideMenu,
      },
    ]"
  >
    <button class="nav-menu-search__icon" @click="handleOpen">
      <span></span>
    </button>
    <el-autocomplete
      ref="inputRef"
      v-model.trim="keyword"
      :fetch-suggestions="querySearch"
      :clearable="true"
      class="nav-menu-search__input"
      popper-class="nav-menu-suggestions"
      placeholder="请输入关键词"
      @select="handleSelect"
      @keydown.esc="handleClose"
      @clear="handleClear"
      @blur="handleClose"
    >
      <template #default="{ item }">
        <div @mousedown="handleSelect(item)">
          <span>
            {{
              `${item.parents.map((menu: NavMenuItem) => menu.text).join(' / ')} / `
            }}
          </span>
          <span v-html="highlight(item.text, keywordArr)" />
        </div>
      </template>
    </el-autocomplete>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'
import { useMenuStore } from '@/stores/menu'
import { useMenuViewsStore } from '@/stores/menuViews'
import highlight from '@/utils/highlight'
import type { NavMenuItem } from '~/types/interfaces'
import { ConvertPinyin } from '@/utils/filterPinyin'

const appStore = useAppStore()
const menuStore = useMenuStore()
const menuViewsStore = useMenuViewsStore()

const inputRef = ref<any>(null)

const isAsideMenu = computed(() => appStore.isAsideMenu)
const isAsideMenuOpen = computed(() => appStore.isAsideMenuOpen)
const searchKeyword = computed(() => menuStore.searchKeyword)
const menuSearchPY = computed(() => menuStore.menuSearchPY)
const history = computed(() => menuStore.menuSearchHistory)
const flatNavMenu = computed(() => menuStore.flatNavMenu)

const keyword = ref('')
const keywordCache = ref('')
const keywordArr = ref<string[]>([])
const internalIsOpen = ref(false)
const filterResult = ref<any[]>([])

const isOpen = computed(() => {
  return (isAsideMenuOpen.value && isAsideMenu.value) || internalIsOpen.value
})

// 对历史数据做过滤，取出当前账号可视内容
const historyFilter = computed(() => {
  return history.value.filter((menu) => menu.show)
})

onMounted(() => {
  keyword.value = searchKeyword.value
})

const querySearch = (
  queryString: string | undefined,
  cb: (result: any[]) => void,
) => {
  if (queryString === undefined) queryString = ''
  menuStore.setSearchKeyword(queryString)

  // 为空时清空关键词
  if (!queryString) {
    if (menuSearchPY.value.length !== 0) {
      keywordArr.value = []
      menuStore.setMenuSearchPY(keywordArr.value)
      menuStore.setMenuSearchPYids([])
    } else {
      menuStore.setMenuSearchPYids([])
    }
  }

  // 关键词相同时使用之前的缓存
  if (keywordCache.value === keyword.value) {
    return cb(
      keywordCache.value === '' ? historyFilter.value : filterResult.value,
    )
  }
  keywordCache.value = keyword.value

  const _queryString = queryString.trim().toLowerCase()
  let result
  let idsResult: string[] = []

  if (_queryString) {
    let _keywordArr: string[] = []
    const keywordReg = new RegExp(queryString, 'gi')
    const ganZiReg = new RegExp('[一-龥]+')

    result = flatNavMenu.value.filter((menu: NavMenuItem) => {
      if (!menu.show || (menu.parents && menu.parents.some((m) => !m.show)))
        return
      let transformPY: string[] = []
      transformPY = ConvertPinyin({
        chinas: menu.text,
        arr: true,
        vals: {
          str: _queryString,
        },
      })

      if (transformPY.length !== 0) {
        _keywordArr.push(...transformPY.map((v: string) => v.toLowerCase()))
        const list = menu.fullIds || []
        idsResult.push(...list)
      }

      if (ganZiReg.test(_queryString) && menu.text.match(keywordReg)) {
        const list = menu.fullIds || []
        idsResult.push(...list)
      }

      if (!menu.isLeaf || !menu.show) return
      if (ganZiReg.test(_queryString)) {
        // 汉字
        _keywordArr.push(_queryString)
        return menu.text.match(keywordReg)
      }
      return transformPY.length !== 0
    })

    keywordArr.value = [...new Set(_keywordArr)]
    // 存储父级id，用于菜单的dot显示
    menuStore.setMenuSearchPYids([...new Set(idsResult)])
  } else {
    result = historyFilter.value
  }

  // 缓存结果
  filterResult.value = result as any[]

  // 性能优化
  if (JSON.stringify(menuSearchPY.value) !== JSON.stringify(keywordArr.value)) {
    menuStore.setMenuSearchPY(keywordArr.value)
  }

  cb(result as any[])
}

const handleSelect = (item: NavMenuItem) => {
  keyword.value = keywordCache.value
  menuViewsStore.addView({
    id: item.id,
    text: item.text,
    href: item.href,
  })
  menuStore.saveMenuSearchHistory(item)
}

const handleOpen = async () => {
  if (!isAsideMenuOpen.value || !isAsideMenu.value) {
    internalIsOpen.value = true
    await nextTick()
    inputRef.value?.focus()
  }
}

const handleClose = async () => {
  if (!isAsideMenuOpen.value || !isAsideMenu.value) {
    internalIsOpen.value = false
  }
  // 接入iframe后无法触发关闭，手动触发，不加延时会导致handleSelect失效
  setTimeout(() => {
    inputRef.value?.close()
  }, 100)
}

const handleClear = async () => {
  await nextTick()
  inputRef.value?.handleFocus()
  inputRef.value?.focus()
  keywordArr.value = []
  menuStore.setMenuSearchPY(keywordArr.value)
  menuStore.setMenuSearchPYids([])
}
</script>

<style lang="less">
.site-container--menu-close .nav-menu-search--open .nav-menu-search__input {
  position: relative;
  width: 200px;
  z-index: 1;
}
.nav-menu-search--open.nav-menu-search--horizon .nav-menu-search__input {
  position: absolute;
  z-index: 1;
  width: 98%;
  height: @menu-view-bar-height;
  top: 0;
  padding: 4px 0;
  box-sizing: border-box;
}
.nav-menu-search {
  position: relative;
  &__icon {
    width: 32px;
    height: 32px;
    border: none;
    padding: 0;
    outline: none;
    position: absolute;
    z-index: 2;
    top: 0;
    left: 6px;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 30px;

    span {
      width: 22px;
      height: 22px;
      display: inline-block;
      vertical-align: middle;
      position: relative;
      transform: rotate(45deg);

      &::before,
      &::after {
        position: absolute;
        content: '';
        box-sizing: border-box;
      }
      &::before {
        width: 12px;
        height: 12px;
        left: 5px;
        top: 2px;
        border-radius: 16px;
        border: 2px solid #fff;
      }
      &::after {
        width: 2px;
        height: 8px;
        left: 10px;
        top: 13px;
        border-radius: 2px;
        background: #fff;
      }
    }
  }
  &__input {
    display: block;
    width: 100%;
    transition:
      width 0.2s ease-in-out,
      opacity 0.2s ease-in-out;
  }

  &--open &__icon {
    opacity: 0;
    pointer-events: none;
    border-radius: 4px;
    width: 100%;
    background-color: #fff;
  }
  &--open &__input {
    opacity: 1;
  }
  &--close &__icon,
  &--horizon &__icon {
    left: 1px;
  }
  &--close &__input {
    opacity: 0;
    width: 32px;
    overflow: hidden;
    border-radius: 4px;
    pointer-events: none;
  }
}
.nav-menu-suggestions {
  width: auto !important;

  .el-scrollbar__view li {
    padding: 0 15px;
    line-height: 2.4em;
    font-size: 12px;
  }

  .hightlight {
    .setHightLight();
  }
}
</style>
