<script lang="tsx">
import { Component, Mixins } from 'vue-property-decorator'

import MenuTitleChild from '@/components/NavMenu/mixins/MenuTitleChild'

@Component
export default class NormalTitle extends Mixins(MenuTitleChild) {
  render() {
    const { menu, ifReplace, replaceHtml, hasChildren } = this

    return (
      <div
        class={[
          'bg-submenu__title',
          { 'set-dot': ifReplace },
          { 'is-new': menu.isNew }
        ]}
        title={this.asideMenuOpen ? menu.text : ''}
      >
        <i
          class={['bg-submenu__title-icon', menu.icon || 'fa fa-file-text-o']}
        />

        <span class="bg-submenu__title-txt" domPropsInnerHTML={replaceHtml} />

        {hasChildren && (
          <i class="bg-submenu__title-arrow el-icon-arrow-down" />
        )}
      </div>
    )
  }
}
</script>
