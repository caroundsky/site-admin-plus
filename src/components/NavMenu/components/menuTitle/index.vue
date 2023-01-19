<script lang="tsx">
import { Vue, Component, Prop, InjectReactive } from 'vue-property-decorator'

import { NavMenuItem } from '~/types/interfaces'

import NormalTitle from './NormalTitle.vue'
import PopoverTitle from './PopoverTitle.vue'

@Component({
  components: { NormalTitle, PopoverTitle }
})
export default class MenuTitle extends Vue {
  @InjectReactive('rootMenu') rootMenu: any

  @Prop({ required: true })
  public menu!: NavMenuItem

  @Prop({ default: 1 })
  public level!: number

  @Prop({ default: false })
  public hasChildren!: boolean

  @Prop({ default: false })
  public ifReplace!: boolean

  @Prop({ default: '' })
  public replaceHtml!: string

  get asideMenuOpen(): boolean {
    return this.rootMenu.asideMenuOpen
  }

  get popoverLevel(): number {
    return this.rootMenu.popoverLevel
  }

  render() {
    /**
     * 定位高亮文本所在的数据列
     * 由ifReplace判断当前数据是否添加指引
     * 1、highlight：返回替换后的html文本（含有高亮和非高亮）和当前是否高亮
     * 2、如果是非高亮，则判断其id是否在‘检索拼音索引数组（menuSearchPYids）’内，menuSearchPYids存储的是检索出来的叶子节点对应的所有父id
     */
    const {
      menu,
      replaceHtml,
      ifReplace,
      asideMenuOpen,
      hasChildren,
      level,
      popoverLevel
    } = this

    const props = {
      props: {
        menu,
        replaceHtml,
        ifReplace,
        asideMenuOpen,
        hasChildren
      }
    }

    return level <= popoverLevel ? (
      <NormalTitle {...props} />
    ) : (
      <PopoverTitle {...props} />
    )
  }
}
</script>
