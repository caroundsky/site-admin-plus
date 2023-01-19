<!--
 * 菜单列（含下级）
 * 组件通信在混入处理，以dispatch的形式通知父组件，父组件通过this.$on来监听
 *
 * 为了尽量减少render次数，尽可能不去变动renderEle以提高性能，特别将一些数据响应分离到事件绑定中去做，将一次性渲染分成单个渲染
 * 比如收缩侧边栏需要重新渲染pop内的内容、更换subMenu的标题结构，这部分的数据响应就绑定在mouseenter中，达到单个渲染的结果
-->
<script lang="tsx">
import { CreateElement, VNode } from 'vue'
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import { NavMenuItem } from '~/types/interfaces'

import Emitter from '@/mixins/emitter'
import MenuMixin from '@/mixins/menuMixin'

import BgCollapseTransition from '@/transitions/collapse-transition'

import highlight from '@/utils/highlight'

const sumArr = (arr: number[]) => arr.reduce((r, v) => r + v, 0)
function splitColumn(
  arr: number[] = [],
  columns = 4,
  columnBaseCount = 20,
  buffer = 12
): number[][] {
  const maxColumns = Math.min(arr.length, columns)
  const columnSum = sumArr(arr)
  const columnAvg = columnSum / maxColumns
  const maxColumnBaseCount = Math.max(...arr, columnAvg, columnBaseCount)
  if (maxColumnBaseCount !== columnBaseCount || maxColumns !== columns) {
    return splitColumn(arr, maxColumns, maxColumnBaseCount)
  }

  const result: number[][] = []
  let curColumn = 0
  let curColumnSum = 0
  buffer = Math.min(maxColumnBaseCount * 0.3, buffer)

  arr.forEach((item) => {
    if (curColumnSum + item < maxColumnBaseCount + buffer) {
      curColumnSum = curColumnSum + item
    } else if (curColumn < maxColumns - 1) {
      curColumn++
      curColumnSum = item
    }
    result[curColumn] = result[curColumn] || []
    result[curColumn].push(item)
  })

  return result
}

@Component({
  components: {
    BgCollapseTransition,
  },
})
export default class SubMenu extends Mixins(Emitter, MenuMixin) {
  @Prop({ default: 1 })
  public level!: number

  @Prop({ default: false })
  public hasChildren!: boolean

  get isMenuPopup(): boolean {
    return this.level === this.rootMenu.popoverLevel
  }
  get isFlatMenu(): boolean {
    return this.level > this.rootMenu.popoverLevel
  }

  get popoverColumnMaxWidth() {
    return this.rootMenu.popoverColumnMaxWidth
  }

  // public title: any = null
  // 用get方法会导致多次render，而watch只产生一次，因此舍弃该方法
  // get opened(): boolean {
  //   // 匹配父组件中的openedMenus来确定当前菜单否打开
  //   return (this.rootMenu as any).openedMenus.indexOf(this.index) > -1
  // }

  @Watch('rootMenu.openedMenus')
  handleOpened(val: Array<string>) {
    this.opened = val.indexOf(this.index) > -1
  }

  @Watch('rootMenu.asideMenuOpen')
  handleMenuOpen(val: boolean) {
    this.title = this.$slots.default && this.$slots.default[0]
    if (val) {
      this.inlineTitle = this.title
      this.popTitle = null
    }
  }
  @Watch('rootMenu.horizonPopMaxH')
  resetDepartNum() {
    this.departNum = 1
  }

  public renderEle: Array<VNode> = []
  public overPopHeight: boolean = false // 是否超出pop最大高度,目前高度是写死500，后续也可以拿出来当参数
  public departNum: number = 1 // pop重排数量，可理解为需要把renderEle分割为departNum个，最大为4个
  public eleArr: any = [] // 存储重排pop的Vnode节点
  public opened: boolean = false
  public inlineTitle: any = null
  public inlineTitleCache: string = ''
  public title: any = null
  public popTitle: any = null

  public horizonScroll: number = 0
  public horizonPopWidth: number = 0

  public showPop = false
  render(h: CreateElement) {
    const popupMenu = !this.rootMenu.horizon
      ? this.verticalPop
      : this.horizonPop
    const inlineMenu = [
      this.inlineTitle,
      this.isFlatMenu ? (
        <ul class="bg-menu">{this.renderEle}</ul>
      ) : (
        <bg-collapse-transition>
          {this.opened && <ul class="bg-menu">{this.renderEle}</ul>}
        </bg-collapse-transition>
      ),
    ]

    return (
      <li
        class={[
          'bg-submenu nav-menu__item',
          `nav-menu__item-lv${this.level}`,
          {
            'is-opened': !this.isMenuPopup && this.opened,
            'nav-menu__item--has-child': this.hasChildren,
            'is-pop': this.isMenuPopup,
          },
        ]}
        on-click={this.subMenuClick}
        on-mouseenter={this.subMenuEnter}
      >
        {this.isMenuPopup ? popupMenu() : inlineMenu}
      </li>
    )
  }

  verticalPop() {
    return (
      <el-popover
        placement="right-start"
        trigger="hover"
        ref="popover"
        transition="bg-pop"
        popper-class={`nav-menu__submenu--pop`}
        onShow={() => this.popuoShow(this)}
        onAfter-leave={this.afterLeave}
        closeDelay={0}
        disabled={this.renderEle.length === 0}
      >
        <div slot="reference">{this.title}</div>
        {this.showPop && (
          <div ref="popMenu" class="nav-menu__submenu--pop__container">
            {this.popTitle}

            {this.overPopHeight
              ? this.eleArr.map((item: any) => {
                  return (
                    <div class="nav-menu__submenu--pop__depart">{item}</div>
                  )
                })
              : this.renderEle}
          </div>
        )}
      </el-popover>
    )
  }

  horizonPop() {
    return (
      <el-popover
        placement="bottom-start"
        trigger="hover"
        ref="horizonPop"
        transition="bg-pop-horizon"
        popper-class={`nav-menu__submenu--pop nav-menu__submenu--pop-horizon`}
        onShow={() => this.horizonPopShow(this)}
        onAfter-leave={this.afterLeave}
        width={this.horizonPopWidth}
        openDelay={0}
        closeDelay={20}
        disabled={this.renderEle.length === 0}
      >
        <div slot="reference">{this.title}</div>
        <keep-alive>
          {this.showPop && (
            <elScrollbar
              class="scroller"
              style={{ height: `${this.horizonScroll}px` }}
            >
              <div
                ref="horizonPopMenu"
                class="nav-menu__submenu--pop__container nav-menu__submenu--pop__horizon"
              >
                {this.overPopHeight
                  ? this.eleArr.map((item: any) => {
                      return (
                        <div class="nav-menu__submenu--pop__depart">{item}</div>
                      )
                    })
                  : this.renderEle}
              </div>
            </elScrollbar>
          )}
        </keep-alive>
      </el-popover>
    )
  }

  created() {
    const length = (this as any).$slots.default.length
    this.renderEle = (this as any).$slots.default.splice(1, length)
    this.title = this.$slots.default && this.$slots.default[0]
    this.inlineTitle = this.title

    this.handleOpened(this.rootMenu.openedMenus)
  }

  subMenuClick(e: Event) {
    // 阻止冒泡,防止触发父级打开/关闭动作
    e.stopPropagation()
    if (this.isMenuPopup) return
    this.dispatch('NavMenu', 'subMenu-click', this)
  }

  subMenuEnter(e: Event) {
    e.stopPropagation()
    this.showPop = true
    if (!this.rootMenu.asideMenuOpen && !this.isFlatMenu) {
      // 做一次值对比，避免重复render
      if (this.inlineTitleCache === this.inlineTitle.tag) return
      this.inlineTitleCache = this.inlineTitle.tag

      this.inlineTitle = (
        <el-popover
          placement="right-start"
          trigger="hover"
          transition="bg-pop"
          popper-class={`nav-menu__submenu--pop`}
          closeDelay={0}
        >
          <div class="bg-submenu__collapse-title" slot="reference">
            {this.title}
          </div>
          <div
            domPropsInnerHTML={highlight(
              this.menuData.text,
              this.rootMenu.menuSearchPY
            )}
          />
        </el-popover>
      )
      this.popTitle = (
        <h3
          class="nav-menu__submenu--pop__title"
          domPropsInnerHTML={highlight(
            this.fullText,
            this.rootMenu.menuSearchPY
          )}
        />
      )
    }
  }

  afterLeave() {
    this.showPop = false
  }

  /**
   * 用于重排pop的dom结构
   * pop高度大于500的时候触发重排，让pop不至于太高
   * 大概思路就是利用一个数组对象存储Vnode节点，再触发渲染
   */
  async popuoShow(vueInstance: any) {
    this.showPop = true
    // 优化性能
    if (this.departNum > 1) return

    await this.$nextTick()
    const popuoHeight = vueInstance.$refs['popMenu'].getClientRects()[0].height
    if (popuoHeight > 500) {
      this.overPopHeight = true
      this.departNum = Math.ceil(popuoHeight / 500)
      if (this.departNum > 3) this.departNum = 3
    }

    this.eleArr = Array.from({ length: this.departNum }, () => [])
    if (this.departNum > 1) {
      const renderEleLength = Math.ceil(this.renderEle.length / this.departNum)

      // 存储需要重排的Vnode节点
      let idx = 0
      this.renderEle.forEach((ele, index) => {
        this.eleArr[idx].length >= renderEleLength ? idx++ : ''
        this.eleArr[idx].push(ele)
      })

      // 结构重排后pop的定位不精确，因此重新调用一次pop组件的计算方法
      await this.$nextTick()
      vueInstance.$refs['popover'].updatePopper()
    }
  }

  async horizonPopShow(vueInstance: any) {
    this.showPop = true
    if (this.departNum > 1) return

    await this.$nextTick()
    const horizonPopMenu = vueInstance.$refs['horizonPopMenu']
    const { horizonPopMaxH } = this.rootMenu
    const height = horizonPopMenu.clientHeight
    this.horizonScroll = height >= horizonPopMaxH ? horizonPopMaxH : height

    if (height > horizonPopMaxH) {
      this.overPopHeight = true
      this.departNum = Math.ceil(height / horizonPopMaxH)
      if (this.departNum > 4) this.departNum = 4
      this.horizonPopWidth = (this.popoverColumnMaxWidth + 10) * this.departNum
    } else {
      this.horizonPopWidth = this.popoverColumnMaxWidth
    }
    this.calcEle(horizonPopMenu, this.departNum)

    await this.$nextTick()
    const _height = horizonPopMenu.clientHeight
    this.horizonScroll = _height >= horizonPopMaxH ? horizonPopMaxH : _height

    // 结构重排后pop的定位不精确，因此重新调用一次pop组件的计算方法
    vueInstance.$refs['horizonPop'].updatePopper()
  }

  /**
   * 横版菜单pop算法（后续可改进）
   * 1、获取子菜单数量，算出平均值
   * 2、新建数组，均分虚拟节点，节点以2级节点为单位，累计算出单位节点的总数是否大于平均值，大于则分配到数组下一位
   * 3、平均值上下浮点8位，该值为自定义。
   * 4、若超出新建数组最大位数，算出哪位分配的数量最少，分配到最少的那一位去
   */
  calcEle(horizonPopMenu: HTMLElement, departNum: number) {
    const average = Math.floor(this.menuDataFlat.length / departNum)

    if (departNum > 1) {
      let vnodeChildNum: any = []

      this.renderEle.forEach((vnode: any) => {
        const htmlStr = vnode.elm.innerHTML || ''
        const menuMatch = htmlStr.match(/bg-submenu__title-txt/g)
        const menuLength = menuMatch ? menuMatch.length : 0

        vnodeChildNum.push(menuLength)
      })

      // NOTE: 此处临时组合菜单数据得到正确排序结果，
      // 过程待优化，其中 splitColumn() 为核心分列方法
      const flatMenus = this.renderEle.map((i) => i)
      const flatMenuCount = vnodeChildNum
      const menuSplitCount = splitColumn(flatMenuCount)

      this.eleArr = menuSplitCount.map((splitColumn) =>
        splitColumn.map(() => flatMenus.shift())
      )

      // 根据重排后的列数，重新计算弹出浮动层宽度
      this.departNum = this.eleArr.length
      this.horizonPopWidth = 240 * this.departNum
    }
  }
}
</script>
