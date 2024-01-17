<script lang="tsx">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import bus from '@/bus'

@Component({
  name: 'PluginSlot',
  components: {
    VNodes: {
      functional: true,
      render: (h: any, ctx: any) => {
        let { vnodes } = ctx.props
        if (import.meta.env.MODE === 'production') {
          return typeof vnodes === 'object' ? vnodes : <span>{vnodes}</span>
        } else {
          const key = new Date().getTime()
          return typeof vnodes === 'object' ? (
            <div key={key}>{vnodes}</div>
          ) : (
            <span key={key}>{vnodes}</span>
          )
        }
      },
    },
  },
})
export default class PluginSlot extends Vue {
  @Prop()
  name!: string

  get pluginSlots() {
    return bus.getSlots(this.name)
  }

  renderPluginSlot(slotsData: Vue | Vue[]): any {
    try {
      return Array.isArray(slotsData) ? (
        <fragment>{slotsData.map(this.renderPluginSlot)}</fragment>
      ) : (
        <slotsData {...{ attrs: this.$attrs }} />
      )
    } catch (e) {
      return null
    }
  }

  get renderComponents() {
    return this.renderPluginSlot(this.pluginSlots)
  }

  render() {
    return <VNodes vnodes={this.renderComponents} />
  }
}
</script>
