<!--
 * menu
-->
<script lang="tsx">
import { CreateElement } from 'vue'
import {
  Vue,
  Component,
  Prop,
  Watch,
  ProvideReactive,
} from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { NavMenuItem, FavNavMenuItem, MenuView } from '~/types/interfaces'

import SubMenu from './subMenu.vue'
import MenuItem from './menuItem.vue'
import horizonSwiper from './horizonSwiper.vue'
import menuTitle from './components/menuTitle/index.vue'

import { debounce } from 'lodash'
import highlight from '@/utils/highlight'
import { TRIGGLE_ASIDE } from '@/constants'

import bus from '@/bus'

const AppModule = namespace('app')
const ThemesModule = namespace('themes')
const MenuModule = namespace('menu')
const MenuViewsModule = namespace('menuViews')

interface navMenuMode {
  [key: string]: boolean
}

const DEFAULT_POPOVER_HEIGHT_RATIO = 0.8
const DEFAULT_POPOVER_COLUMN_MAX_WIDTH = 220

@Component({
  components: {
    SubMenu,
    MenuItem,
    horizonSwiper,
    menuTitle,
  },
})
export default class NavMenu extends Vue {
  @AppModule.State('isInited')
  public appInited!: boolean

  @AppModule.State('isAsideMenu')
  public isAsideMenu!: boolean

  @AppModule.State('isAsideMenuOpen')
  public asideMenuOpen!: boolean

  @AppModule.State('menuKey')
  public menuKey!: number

  @AppModule.State('isUserSet')
  public isUserSet!: boolean

  @AppModule.Action('toggleSideMenu')
  public toggleSideMenu!: () => void

  @MenuModule.State('navMenu')
  public menuData!: NavMenuItem[]

  @MenuModule.State('navMenuMode')
  public navMenuMode!: navMenuMode

  @MenuModule.State('searchKeyword')
  public searchKeyword!: string

  @MenuModule.State('menuSearchPY')
  public menuSearchPY!: string[] // 检索的关键字组

  @MenuModule.State('menuSearchPYids')
  public menuSearchPYids!: string[] // 检索存储的父id组

  @MenuViewsModule.Action('addView')
  public addMenuView!: (view: MenuView) => void

  get horizon(): boolean {
    return this.$attrs.horizon !== undefined
  }

  @Watch('appInited')
  handleInit(val: boolean) {
    if (val && this.horizon) {
      this.horizonNavMaxW = Math.ceil(
        (this.$parent.$refs[
          'horizon-operat'
        ] as HTMLElement).getBoundingClientRect().width
      )
    }
  }

  @Prop({ default: 1 })
  public popoverLevel!: number // 达到使用层级折叠结构的最大层级

  @Prop({ default: true })
  public uniqueOpened!: Boolean // 是否只保持一个子菜单的展开

  public openedMenus: string[] = [] // 展开的菜单id组
  public horizonPopMaxH: number = 0
  public horizonNavMaxW: number = 324

  private listenerResize: any

  get navMenuConfig() {
    return bus.config.navMenu || {}
  }

  get popoverColumnMaxWidth() {
    return (
      this.navMenuConfig.popoverColumnMaxWidth ||
      DEFAULT_POPOVER_COLUMN_MAX_WIDTH
    )
  }

  @ProvideReactive() // ProvideReactive为响应式，而Provide只提供一个值应用
  rootMenu = {}

  created() {
    // 实例化完成后再赋值，不然会无法响应式绑定 （重要）
    this.rootMenu = this
  }

  render(h: CreateElement) {
    // 渲染菜单
    return (
      <div
        key={this.menuKey}
        class={[
          'bg-nav-menu',
          {
            'bg-nav-menu--horizon': this.horizon,
            'bg-nav-menu--close': !this.asideMenuOpen,
            'bg-nav-menu--nosearch': !this.navMenuConfig.search,
          },
        ]}
        style={{
          maxWidth:
            this.horizon && `calc(100% - 50px - ${this.horizonNavMaxW}px)`,
        }}
      >
        {this.horizon ? (
          <horizon-swiper class={['bg-menu nav-menu__menu']}>
            {this.menuData.map((menu) => this.renderMenuItem(menu))}
          </horizon-swiper>
        ) : (
          <ul class={['bg-menu nav-menu__menu']}>
            {this.menuData.map((menu) => this.renderMenuItem(menu))}
          </ul>
        )}
      </div>
    )
  }

  // 菜单逻辑
  renderMenuItem(menu: NavMenuItem, level: number = 1) {
    const hasChildren = Array.isArray(menu.children) && menu.children.length > 0

    // 不显示
    if (!menu.show) return
    if (level === 1 && !this.navMenuMode[menu.id]) return

    let { ifReplace, replaceHtml } = highlight(
      menu.text,
      this.menuSearchPY,
      'object'
    )
    if (!ifReplace) {
      ifReplace = this.menuSearchPYids.indexOf(menu.id) !== -1
    }

    let key = menu.id + ifReplace + this.searchKeyword

    const _menuTitle = (
      <menuTitle
        menu={menu}
        level={level}
        hasChildren={hasChildren}
        ifReplace={ifReplace}
        replaceHtml={replaceHtml}
      />
    )

    if (hasChildren) {
      return (
        <sub-menu
          key={key}
          menuData={menu}
          level={level}
          hasChildren={hasChildren}
        >
          {[
            _menuTitle,
            menu.children.map((child) => this.renderMenuItem(child, level + 1)),
          ]}
        </sub-menu>
      )
    } else {
      return (
        <menu-item key={key} menuData={menu} level={level}>
          {_menuTitle}
        </menu-item>
      )
    }
  }

  async mounted() {
    await this.$nextTick()

    this.horizonPopMaxH =
      window.innerHeight *
      (this.navMenuConfig.popoverHeightRatio || DEFAULT_POPOVER_HEIGHT_RATIO)

    if (this.horizon && this.appInited) {
      this.horizonNavMaxW = Math.ceil(
        (this.$parent.$refs[
          'horizon-operat'
        ] as HTMLElement).getBoundingClientRect().width
      )
    }

    this.$on('subMenu-click', this.handleSubmenuClick)
    this.$on('item-click', this.handleItemClick)

    this.listenerResize = debounce(() => {
      this.horizonPopMaxH =
        window.innerHeight *
        (this.navMenuConfig.popoverHeightRatio || DEFAULT_POPOVER_HEIGHT_RATIO)

      const WW = window.innerWidth
      if (WW <= TRIGGLE_ASIDE && this.asideMenuOpen) {
        this.toggleSideMenu()
      }
      if (WW > TRIGGLE_ASIDE && !this.asideMenuOpen && !this.isUserSet) {
        this.toggleSideMenu()
      }
    }, 200)

    window.addEventListener('resize', this.listenerResize)
  }

  handleSubmenuClick(submenu: any) {
    /**
     * submenu 为菜单实例
     * index 为展开submenu的id
     * indexPath 包含当前id，以及父级id(假如有的话)
     */
    const { index, indexPath } = submenu
    let isOpened = this.openedMenus.indexOf(index) !== -1
    if (isOpened) {
      this.closeMenu(index)
    } else {
      this.openMenu(index, indexPath)
    }
  }
  closeMenu(index: string) {
    const i = this.openedMenus.indexOf(index)
    if (i !== -1) {
      this.openedMenus.splice(i, 1)
    }
  }
  openMenu(index: string, indexPath: Array<string>) {
    let openedMenus = this.openedMenus
    if (openedMenus.indexOf(index) !== -1) return
    if (this.uniqueOpened) {
      // 展开唯一时，将不在该菜单路径下的其余菜单收起
      this.openedMenus = openedMenus.filter((item) => {
        return indexPath.indexOf(item) !== -1
      })
    }
    this.openedMenus.push(index)
  }

  handleItemClick(item: any) {
    this.addMenuView({
      id: item.id,
      text: item.text,
      href: item.href,
    })
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.listenerResize)
  }
}
</script>

<style lang="less">
@import './navMenu.less';
</style>
