import { Component, Prop, Vue } from 'vue-property-decorator'
import { NavMenuItem } from '~/types/interfaces'

@Component
export default class MenuTitleChild extends Vue {
  @Prop({ required: true })
  public menu!: NavMenuItem

  @Prop({ default: false })
  public hasChildren!: boolean

  @Prop({ default: false })
  public ifReplace!: boolean

  @Prop({ default: '' })
  public replaceHtml!: string

  @Prop({ default: false })
  public asideMenuOpen!: boolean
}
