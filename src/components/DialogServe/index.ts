import Vue from 'vue'
import Dialog from './main.vue'

import { isPlainObject } from 'lodash'

const dialogConstructor = Vue.extend(Dialog)
let lastInstance: any = null
let instance: any = null

export default function(options?: any) {
  instance = new dialogConstructor({
    data: isPlainObject(options) ? options : {}
  })

  if (lastInstance) {
    let $el = lastInstance.$el
    lastInstance.$destroy()
    $el.parentNode && $el.parentNode.removeChild($el)
    lastInstance = null
  }
  lastInstance = instance

  const vm = instance.$mount()
  document.body.appendChild(vm.$el)
  instance.visible = true
  return vm
}
