/**
 * 折叠过渡动画组件
 * Vue 3 版本
 */
import { defineComponent, h, Transition } from 'vue'

export default defineComponent({
  name: 'BgCollapseTransition',

  setup(_, { slots }) {
    const onData = {
      onBeforeEnter(el: HTMLElement) {
        el.classList.add('bg-menu--collapse')
        el.style.height = '0'
      },

      onEnter(el: HTMLElement) {
        if (el.scrollHeight !== 0) {
          el.style.height = el.scrollHeight + 'px'
        } else {
          el.style.height = ''
        }
        el.style.overflow = 'hidden'
      },

      onAfterEnter(el: HTMLElement) {
        el.classList.remove('bg-menu--collapse')
        el.style.height = ''
        el.style.overflow = ''
      },

      onBeforeLeave(el: HTMLElement) {
        el.style.height = el.scrollHeight + 'px'
        el.style.overflow = 'hidden'
      },

      onLeave(el: HTMLElement) {
        if (el.scrollHeight !== 0) {
          el.classList.add('bg-menu--collapse')
          el.style.height = '0'
        }
      },

      onAfterLeave(el: HTMLElement) {
        el.classList.remove('bg-menu--collapse')
        el.style.height = ''
        el.style.overflow = ''
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
