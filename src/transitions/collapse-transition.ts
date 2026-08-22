/**
 * 折叠过渡动画组件
 * Vue 3 版本
 */
import { defineComponent, h, Transition } from 'vue'

export default defineComponent({
  name: 'BgCollapseTransition',

  setup(_, { slots }) {
    const onData = {
      onBeforeEnter(el: Element) {
        const htmlEl = el as HTMLElement
        htmlEl.classList.add('bg-menu--collapse')
        htmlEl.style.height = '0'
      },

      onEnter(el: Element) {
        const htmlEl = el as HTMLElement
        if (htmlEl.scrollHeight !== 0) {
          htmlEl.style.height = htmlEl.scrollHeight + 'px'
        } else {
          htmlEl.style.height = ''
        }
        htmlEl.style.overflow = 'hidden'
      },

      onAfterEnter(el: Element) {
        const htmlEl = el as HTMLElement
        htmlEl.classList.remove('bg-menu--collapse')
        htmlEl.style.height = ''
        htmlEl.style.overflow = ''
      },

      onBeforeLeave(el: Element) {
        const htmlEl = el as HTMLElement
        htmlEl.style.height = htmlEl.scrollHeight + 'px'
        htmlEl.style.overflow = 'hidden'
      },

      onLeave(el: Element) {
        const htmlEl = el as HTMLElement
        if (htmlEl.scrollHeight !== 0) {
          htmlEl.classList.add('bg-menu--collapse')
          htmlEl.style.height = '0'
        }
      },

      onAfterLeave(el: Element) {
        const htmlEl = el as HTMLElement
        htmlEl.classList.remove('bg-menu--collapse')
        htmlEl.style.height = ''
        htmlEl.style.overflow = ''
      },
    }

    return () =>
      h(
        Transition,
        {
          name: 'bg-collapse',
          ...onData,
        },
        { default: slots.default },
      )
  },
})
