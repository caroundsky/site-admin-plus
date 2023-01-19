<!--
 * 底栏
-->
<template>
  <FlexContainer
    :class="['fav-menu-bar', { 'fav-menu-bar__collapse': collapse }]"
  >
    <div
      v-show="!favMenuMap[activeMenuId]"
      :class="['fav-menu__act', { disabled: activeMenuId === HOME_PAGE }]"
      @click="handleAddFav"
    >
      <i class="el-icon-circle-plus-outline" />
      {{ $t('加入收藏') }}
    </div>
    <div
      v-show="favMenuMap[activeMenuId]"
      class="fav-menu__act"
      @click="handleDelFav"
    >
      <i class="el-icon-remove-outline" />
      {{ $t('取消收藏') }}
    </div>
    <FlexMain class="fav-menu__main">
      <FlexContainer>
        <FlexMain>
          <ScrollPane ref="scrollPane" class="view-tabs-scroll">
            <Container
              class="view-tabs-wrap"
              behaviour="contain"
              orientation="horizontal"
              @drop="onDrop"
            >
              <Draggable v-for="(item, index) in favMenu" :key="item.id">
                <span
                  :class="[
                    'fav-menu__item',
                    { 'fav-menu__item--hover': hoverIndex === index },
                  ]"
                  @click="() => handleFavClick(item.id)"
                  @contextmenu.prevent="(e) => onContextmenu(e, item, index)"
                >
                  {{ item.text }}
                </span>
              </Draggable>
            </Container>
          </ScrollPane>
        </FlexMain>
        <!-- <div class="fav-menu__act">
          <i class="el-icon-caret-top" />
        </div> -->
      </FlexContainer>
    </FlexMain>
    <div
      class="fav-menu__act"
      :title="collapse ? '展开' : '收起'"
      @click="handleCollapse"
    >
      <i :class="collapse ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" />
    </div>
  </FlexContainer>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { mapFields } from 'vuex-map-fields'

import { Container, Draggable } from 'vue-smooth-dnd'
import applyDrag from '@/utils/applyDrag'
import ScrollPane from '@/layouts/components/MenuViewBar/ScrollPane.vue'

import { FavNavMenuItem, MenuView } from '~/types/interfaces'

import buttons from '../contextMenu/buttons'
import bus from '@/bus'

const MenuViewsModule = namespace('menuViews')
const FavMenuModule = namespace('favMenu')

@Component({
  components: {
    Container,
    Draggable,
    ScrollPane,
  },
  computed: {
    ...mapFields('favMenu', ['favMenu']),
  },
})
export default class FavMenuBar extends Vue {
  @MenuViewsModule.State('activeId')
  public activeMenuId!: string

  @MenuViewsModule.Getter('activeView')
  public activeView!: MenuView

  @MenuViewsModule.Action('addViewById')
  public addViewById!: (menuId: MenuView['id']) => void

  @FavMenuModule.Getter('favMenuMap')
  public favMenuMap!: { [k: string]: FavNavMenuItem }

  @FavMenuModule.Action('addFav')
  public addFav!: (view: MenuView) => void

  @FavMenuModule.Action('delFav')
  public delFav!: (view: MenuView) => void

  public favMenu!: FavNavMenuItem[]
  public hoverIndex: number = -1
  public collapse: boolean = false
  HOME_PAGE = bus.config.HOME_PAGE

  handleAddFav() {
    if (!this.activeMenuId || this.activeMenuId === this.HOME_PAGE) return
    this.addFav(this.activeView)
  }

  handleDelFav() {
    this.delFav(this.activeView)
  }

  handleFavClick(menuId: string) {
    this.addViewById(menuId)
  }

  handleCollapse() {
    this.collapse = !this.collapse
  }

  onDrop(dropResult: any) {
    this.favMenu = applyDrag(this.favMenu, dropResult)
  }

  onContextmenu(event: Event, view: MenuView, index: number) {
    event.preventDefault()

    // href做个转换，因为部分接口url并非完整链接
    let newView = { ...view }

    this.hoverIndex = index
    this.$contextmenu({
      event,
      view: newView,
      definedBtn: buttons(view, ['windowOpen', 'collect']),
      afterDestory: () => {
        this.hoverIndex = -1
      },
    })
  }
}
</script>

<style lang="less" scoped>
.fav-menu-bar {
  height: 28px;
  line-height: 28px;
  font-size: 12px;
  box-shadow: 0 0 4px 1px #e1e1e1;
  background: #fff;
  display: flex;

  & > div:not(:last-child) {
    transition: ease 0.3s;
  }

  & > div:last-child {
    // transition-delay: 250ms;
  }

  &__collapse {
    transition-delay: 250ms;
    height: 0;
    & > div:not(:last-child) {
      transform: translateY(100%);
    }
    & > div:last-child {
      transition-delay: 250ms;
      background: #fff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.23), 0 0px 5px rgba(0, 0, 0, 0.03);
      transition-property: transform;
      transform: translateY(-100%);
    }
  }
}

.view-tabs-wrap {
  display: flex;
}

.fav-menu__act {
  color: #288add;
  color: var(--theme-color);
  border: none;
  background-color: transparent;
  height: 28px;
  cursor: pointer;
  outline: none;
  padding: 0 1em;

  &.disabled {
    color: #c0c0c0;
    cursor: no-drop;
  }

  &:hover:not(.disabled) {
    background-color: rgb(204, 226, 240);
  }
}

.fav-menu__item {
  display: block;
  padding: 0 1em;
  cursor: pointer;
  white-space: nowrap;

  &:hover,
  &--hover {
    color: #288add;
    color: var(--theme-color);
    background-color: rgba(0, 112, 178, 0.2);
  }
}
</style>
