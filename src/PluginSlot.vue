<script lang="tsx">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import bus from '@/bus'

@Component({
  abstract: true,
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

  render() {
    return this.renderPluginSlot(this.pluginSlots)
  }
}
</script>
