import { Plugin } from '@caroundsky/lemon-admin'
import NetTest from './NetTest.vue'

export default function (): Plugin {
  return {
    name: 'netTestBtn',
    slots: {
      'action-bar-addon': NetTest,
    },
  }
}
