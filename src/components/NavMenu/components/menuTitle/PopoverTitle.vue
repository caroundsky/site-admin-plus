<script lang="tsx">
import { Component, Mixins } from 'vue-property-decorator'

import MenuTitleChild from '@/components/NavMenu/mixins/MenuTitleChild'

@Component({
  name: 'PopoverTitle',
})
export default class PopoverTitle extends Mixins(MenuTitleChild) {
  render() {
    const { replaceHtml, menu } = this
    return (
      <span class={['bg-submenu__title-txt', { 'is-new': menu.isNew }]}>
        <span domPropsInnerHTML={replaceHtml} />
        {menu.help && menu.helpUrl && (
          <i
            class="help-icon fa fa-question-circle-o"
            title="帮助"
            on-click={(e: Event) => this.helpDocument(e, menu.helpUrl)}
          />
        )}
      </span>
    )
  }
  // 跳转到帮助中心文档
  helpDocument(e: Event, url: string) {
    e.stopPropagation()
    window.open(url)
  }
}
</script>
