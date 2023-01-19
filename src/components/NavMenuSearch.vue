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
    <ElAutocomplete
      ref="input"
      v-model.trim="keyword"
      :fetch-suggestions="querySearch"
      :clearable="true"
      class="nav-menu-search__input"
      popper-class="nav-menu-suggestions"
      size="small"
      placeholder="请输入关键词"
      prefix-icon="el-icon-search"
      @select="handleSelect"
      @keydown.native.esc="handleClose"
      @clear="handleClear"
      @blur="handleClose"
    >
      <template slot-scope="{ item }">
        <div @mousedown="handleSelect(item)">
          <span>
            {{ `${item.parents.map((menu) => menu.text).join(' / ')} / ` }}
          </span>
          <span v-html="highlight(item.text, keywordArr)" />
        </div>
      </template>
    </ElAutocomplete>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { NavMenuItem, MenuView } from '~/types/interfaces'
import highlight from '@/utils/highlight'
// @ts-ignore
import { tranformToPinyin } from '@/utils/filterPinyin/ChineseToPinyin_1_0.js'

const AppModule = namespace('app')
const MenuModule = namespace('menu')
const MenuViewsModule = namespace('menuViews')

const pinyin = new tranformToPinyin()

@Component({
  methods: {
    highlight,
  },
})
export default class NavMenuSearch extends Vue {
  $refs: any
  @AppModule.State('isAsideMenu')
  public isAsideMenu!: boolean

  @AppModule.State('isAsideMenuOpen')
  public isAsideMenuOpen!: boolean

  @MenuModule.State('searchKeyword')
  public searchKeyword!: string

  @MenuModule.State('menuSearchPY')
  public menuSearchPY!: string[]

  @MenuModule.State('menuSearchHistory')
  public history!: NavMenuItem[]

  @MenuModule.Getter('flatNavMenu')
  public flatNavMenu!: NavMenuItem[]

  @MenuModule.Action('setSearchKeyword')
  public setSearchKeyword!: (keyword: string) => void

  @MenuModule.Action('setMenuSearchPY')
  public setMenuSearchPY!: (word: string[]) => void

  @MenuModule.Action('setMenuSearchPYids')
  public setMenuSearchPYids!: (id: string[]) => void

  @MenuModule.Action('initSearchHistory')
  public initSearchHistory!: (obj: NavMenuItem) => void

  @MenuModule.Action('saveMenuSearchHistory')
  public saveMenuSearchHistory!: (obj: NavMenuItem) => void

  @MenuViewsModule.Action('addView')
  public addMenuView!: (view: MenuView) => void

  keyword: string = ''
  keywordCache: string = ''
  keywordArr: string[] = []
  internalIsOpen: boolean = false
  filterResult: any = []

  get isOpen() {
    return (this.isAsideMenuOpen && this.isAsideMenu) || this.internalIsOpen
  }

  // 对历史数据做过滤，取出当前账号可视内容
  get historyFilter(): NavMenuItem[] {
    return this.history.filter((menu) => menu.show)
  }

  mounted() {
    this.keyword = this.searchKeyword
  }

  querySearch(queryString: string, cb: (result: any) => void) {
    if (queryString === undefined) queryString = ''
    this.setSearchKeyword(queryString)
    // 为空时清空关键词
    if (!queryString) {
      if (this.menuSearchPY.length !== 0) {
        this.keywordArr = []
        this.setMenuSearchPY(this.keywordArr)
        this.setMenuSearchPYids([])
      } else {
        this.setMenuSearchPYids([])
      }
    }

    // 关键词相同时使用之前的缓存
    if (this.keywordCache === this.keyword) {
      return cb(
        this.keywordCache === '' ? this.historyFilter : this.filterResult
      )
    }
    this.keywordCache = this.keyword

    const _queryString = queryString.trim().toLowerCase()
    let result
    let idsResult: string[] = []

    if (_queryString) {
      let _keywordArr: string[] = []
      const keywordReg = new RegExp(queryString, 'gi')
      const ganZiReg = new RegExp('[\u4e00-\u9fa5]+')

      result = this.flatNavMenu.filter((menu: NavMenuItem) => {
        if (!menu.show || (menu.parents && menu.parents.some((m) => !m.show)))
          return
        let transformPY = []
        transformPY = pinyin.ConvertPinyin({
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

      this.keywordArr = [...new Set(_keywordArr)]
      // 存储父级id，用于菜单的dot显示
      this.setMenuSearchPYids([...new Set(idsResult)])
    } else {
      result = this.historyFilter
    }

    // 缓存结果
    this.filterResult = result

    // 性能优化
    if (JSON.stringify(this.menuSearchPY) !== JSON.stringify(this.keywordArr)) {
      this.setMenuSearchPY(this.keywordArr)
    }

    cb(result)
  }

  handleSelect(item: NavMenuItem) {
    this.keyword = this.keywordCache
    this.addMenuView({
      id: item.id,
      text: item.text,
      href: item.href,
    })
    this.saveMenuSearchHistory(item)
  }

  async handleOpen() {
    if (!this.isAsideMenuOpen || !this.isAsideMenu) {
      this.internalIsOpen = true
      await this.$nextTick()
      this.$refs.input.focus()
    }
  }

  async handleClose() {
    if (!this.isAsideMenuOpen || !this.isAsideMenu) {
      this.internalIsOpen = false
    }
    // 接入iframe后无法触发关闭，手动触发，不加延时会导致handleSelect失效，后续找找解决方案
    setTimeout(() => {
      this.$refs.input.close()
    }, 100)
  }

  async handleClear() {
    await this.$nextTick()
    this.$refs.input.handleFocus()
    this.$refs.input.focus()
    this.keywordArr = []
    this.setMenuSearchPY(this.keywordArr)
    this.setMenuSearchPYids([])
  }
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
    // transition: background-color 0.2s ease-in-out;
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
    transition: width 0.2s ease-in-out, opacity 0.2s ease-in-out;
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
