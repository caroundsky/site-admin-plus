export default {
  functional: true,
  render(createElement: any, context: any) {
    const data = {
      props: {
        mode: 'out-in'
      },
      on: {
        beforeEnter(el: any) {
          el.classList.add('bg-menu--collapse')
          el.style.height = 0
        },
        enter(el: any) {
          if (el.scrollHeight !== 0) {
            el.style.height = el.scrollHeight + 'px'
          } else {
            el.style.height = ''
          }
          el.style.overflow = 'hidden'
        },
        afterEnter(el: any) {
          el.classList.remove('bg-menu--collapse')
          el.style.height = ''
          el.style.overflow = ''
        },
        beforeLeave(el: any) {
          el.style.height = el.scrollHeight + 'px'
          el.style.overflow = 'hidden'
        },
        leave(el: any) {
          // 此处的视图表现形式有点奇怪，需要判断scrollHeight !== 0 或者给动作一个延时才能出现收回动画
          if (el.scrollHeight !== 0) {
            el.classList.add('bg-menu--collapse')
            el.style.height = 0
          }
        },
        afterLeave(el: any) {
          el.classList.remove('bg-menu--collapse')
          el.style.height = ''
          el.style.overflow = ''
        }
      }
    }
    return createElement('transition', data, context.children)
  }
}
