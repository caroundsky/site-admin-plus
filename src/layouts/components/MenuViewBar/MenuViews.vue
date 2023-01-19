<!--
 * tab栏
-->
<script lang="tsx">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { mapFields } from 'vuex-map-fields'

import { Container, Draggable } from 'vue-smooth-dnd'
import ScrollPane from './ScrollPane.vue'
import applyDrag from '@/utils/applyDrag'

import { MenuView } from '~/types/interfaces'

import { sortBy } from 'lodash'
import bus from '@/bus'

const MenuViewsModule = namespace('menuViews')
const AppModule = namespace('app')

@Component({
  components: {
    ScrollPane,
    Container,
    Draggable,
  },
  computed: {
    ...mapFields('menuViews', ['views']),
  },
})
export default class MenuViews extends Vue {
  @AppModule.State('isAsideMenu')
  public isAsideMenu!: boolean

  @AppModule.Action('setMenuTabTouch')
  public setMenuTabTouch!: (val: boolean) => void

  @AppModule.Action('setMenuTabMoveInArea')
  public setMenuTabMoveInArea!: (val: boolean) => void

  @MenuViewsModule.State('views')
  public menuViews!: MenuView[]

  @MenuViewsModule.State('activeId')
  public activeId!: MenuView['id']

  @MenuViewsModule.Action('activeView')
  public activeView!: (view: MenuView) => void

  @MenuViewsModule.Action('closeView')
  public closeView!: (view: MenuView) => void

  @MenuViewsModule.Action('setViews')
  public setViews!: (views: MenuView[]) => void

  public views!: MenuView[]
  public viewTabsWidth: number = 700
  public hoverIndex: number = -1
  public removeOnDropOut: boolean = false

  private contentArea: any
  private mainCont: any
  private moveView: any
  private animaDuration: number = 250
  private moveInArea: boolean = false
  public FIXED_DRAG = bus.config.FIXED_DRAG || []

  @Watch('activeId')
  async handleActiveId(id: MenuView['id']) {
    const { scrollPane } = this.$refs
    const targetMenu = this.menuViews.find((menu) => menu.id === id)
    targetMenu && (scrollPane as any).moveToTarget(targetMenu.text)
  }

  @Watch('menuViews')
  handleMenuViews() {
    this.calcTabsWidth()
  }

  @Watch('isAsideMenu')
  handleAsideMenu() {
    this.calcTabsWidth()
  }

  async calcTabsWidth() {
    await this.$nextTick()
    const { container, tag } = this.$refs
    if (!tag) return
    // @ts-ignore
    const $dragMenu = tag.map((item) => {
      return item.$el
    })

    let result = 0
    for (const el of $dragMenu) {
      result += el.getBoundingClientRect().width
    }
    this.viewTabsWidth = Math.ceil(result)
  }

  onDrop(dropResult: any) {
    const targetId = this.views[dropResult.addedIndex].id
    if (this.FIXED_DRAG.includes(targetId)) return
    this.views = applyDrag(this.views, dropResult)
  }

  onDropStart(dragResult: any) {
    this.animaDuration = 250
    this.setMenuTabTouch(true)
    this.$nextTick(() => {
      const ghostDom = document.getElementsByClassName('smooth-dnd-ghost')[0]
      if (!ghostDom) return

      this.contentArea = document.getElementsByClassName(
        'flex-main__content'
      )[0]
      this.mainCont = document.getElementsByClassName('main-content')[0]
      if (!this.contentArea) return
      this.moveView = dragResult.payload
      document.addEventListener('mouseup', this.onMouseUp)
      document.addEventListener('mousemove', this.onMouseMove)
    })
  }

  async onMouseUp() {
    // @ts-ignore
    if (this.contentArea.contains(window.event.srcElement)) {
      // @ts-ignore
      document.getElementsByClassName('smooth-dnd-ghost')[0].style.display =
        'none'
      this.removeOnDropOut = true
      this.closeView(this.moveView)
    }

    this.setMenuTabTouch(false)
    this.setMenuTabMoveInArea(false)
    this.moveInArea = false
    document.removeEventListener('mouseup', this.onMouseUp)
    document.removeEventListener('mousemove', this.onMouseMove)
    this.removeOnDropOut = false
  }

  onMouseMove() {
    // @ts-ignore
    if (this.contentArea.contains(window.event.srcElement)) {
      if (this.mainCont.classList.contains('move-in-area')) return
      this.animaDuration = 0
      this.moveInArea = true
      this.setMenuTabMoveInArea(true)
    } else {
      if (!this.mainCont.classList.contains('move-in-area')) return
      this.animaDuration = 250
      this.moveInArea = false
      this.setMenuTabMoveInArea(false)
    }
  }

  getChildPayload(index: number) {
    return this.menuViews[index]
  }

  getGhostParent() {
    return document.body
  }

  // -> \components\ContextMenu\index.ts
  onContextmenu(event: Event, view: MenuView, index: number) {
    event.preventDefault()

    let newView = { ...view }

    if (
      !bus.setContextMenu['menuViewBar'] ||
      typeof bus.setContextMenu['menuViewBar'] !== 'function'
    )
      return

    const definedBtn = bus.setContextMenu['menuViewBar']

    this.hoverIndex = index
    this.$contextmenu({
      event,
      definedBtn: definedBtn(view),
      view: newView,
      afterDestory: () => {
        this.hoverIndex = -1
      },
    })
  }

  render() {
    // 对menuViews做一次排序，目的是筛出固定不动的页签，将他们排到最前面
    let sortMenuViews = sortBy(this.menuViews, [
      (view) => {
        return !this.FIXED_DRAG.includes(view.id)
      },
    ])

    return (
      // @ts-ignore
      <ScrollPane ref="scrollPane" class="view-tabs-scroll">
        <Container
          ref="container"
          orientation="horizontal"
          class="view-tabs-wrap"
          style={{ width: `${this.viewTabsWidth}px` }}
          on-drop={this.onDrop}
          on-drag-start={this.onDropStart}
          non-drag-area-selector=".no-draggable"
          get-child-payload={this.getChildPayload}
          remove-on-drop-out={this.removeOnDropOut}
          get-ghost-parent={this.getGhostParent}
          animation-duration={this.animaDuration}
        >
          {sortMenuViews.map((view, index) => (
            <Draggable
              ref="tag"
              class={{
                'view-tab-wrap': true,
                'no-draggable': this.FIXED_DRAG.includes(view.id),
                'in-area': this.moveInArea,
              }}
              refInFor={true}
              title={view.text}
            >
              <div
                refInFor={true}
                key={view.id}
                class={{
                  'view-tab': true,
                  'view-tab--horizon': !this.isAsideMenu,
                  'view-tab--active': view.id === this.activeId,
                  'view-tab--hover':
                    this.hoverIndex === index && view.id !== this.activeId,
                }}
                on-click={() => this.activeView(view)}
                on-contextmenu={(e: Event) =>
                  this.onContextmenu(e, view, index)
                }
              >
                <span class="view-tab__text" domPropsInnerHTML={view.text} />
                {view.closable && (
                  <span
                    class="view-tab__close"
                    on-click={(e: Event) => {
                      e.stopPropagation()
                      this.closeView(view)
                    }}
                  >
                    <i class="el-icon-close" />
                  </span>
                )}
              </div>
            </Draggable>
          ))}
        </Container>
      </ScrollPane>
    )
  }
}
</script>
<style lang="less" scoped>
.smooth-dnd-ghost .view-tab {
  box-shadow: 0 0 10px 0 #d1d1d1;
  background-color: #fff;
  color: #333;
  &::after {
    display: none;
  }
}

.smooth-dnd-container {
  display: inline-block;
  min-width: 300px;
}

.view-tabs-scroll {
  position: relative;
  height: 100%;
}

.view-tab {
  position: relative;
  display: inline-block;
  margin-right: -1px;
  line-height: @menu-view-bar-height;
  cursor: pointer;
  background-color: #fff;
  user-select: none;
  font-size: 14px;
  /deep/&-wrap {
    display: inline-block !important;
  }

  &::after {
    content: '';
    right: 0;
    position: absolute;
    z-index: 2;
    top: 50%;
    display: block;
    width: 1px;
    height: 12px;
    content: '';
    background-color: #ddd;
    transform: translateY(-50%);
  }

  &:hover {
    z-index: 1;
    .view-tab__close {
      opacity: 1;
    }
  }

  &--active {
    color: #fff;
    background-color: rgb(0, 112, 178);
    background-color: var(--theme-color);
    z-index: 2;
    transition: background-color 0.2s, color 0.2s;

    &::after {
      display: none;
    }
    &:hover {
      z-index: 3;
      .view-tab__close {
        color: #fff;
      }
    }
  }

  &--hover {
    color: var(--theme-color);
    background-color: rgba(0, 112, 178, 0.2);
  }

  &-wrap {
    // transition-duration: 0ms !important;
    &.in-area {
      transition-duration: 0ms !important;
    }
  }

  .view-tab__text {
    display: block;
    padding: 0 1.2em;
    transition: transform 0.2s;
  }

  .view-tab__close {
    position: absolute;
    padding: 1px;
    width: 1em;
    height: 1em;
    line-height: 1em;
    font-size: 12px;
    font-weight: 700;
    top: 2px;
    right: 2px;
    color: #333;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.1s;
    background-color: transparent;
    opacity: 0;

    &:hover {
      color: #fff;
      background-color: #d9413c;
    }
  }
}

.view-tab:not(.view-tab--active):hover {
  color: rgb(0, 112, 178);
  color: var(--theme-color);
  background-color: rgba(0, 112, 178, 0.2);
}

.view-tab--horizon {
  font-size: 12px;
  line-height: @menu-view-bar-height - 10px;
  border-radius: 3px 3px 0px 0px;
}

.no-draggable {
  transform: none !important;
}
</style>
