import { defineStore } from 'pinia'
import keyBy from 'lodash/keyBy'
import type { Theme } from './types'
import bus from '@/bus'

interface State {
  allThemes: readonly Theme[]
  currentTheme: string
}

const THEMES: Theme[] = [
  { name: 'default' },
  { name: 'primary' },
  { name: 'gray' },
  { name: 'red' },
  { name: 'grow-early' },
  { name: 'plum-plate' },
  { name: 'midnight-bloom' },
  { name: 'night-sky' },
  { name: 'slick-carbon' },
  { name: 'royal' },
]
const THEMES_MAP = keyBy(THEMES, 'name')

export const useThemesStore = defineStore('themes', {
  state: (): State => ({
    allThemes: Object.freeze(THEMES),
    currentTheme: 'default',
  }),

  actions: {
    init() {
      this.updateBodyThemeName()
    },

    changeTheme(newThemeName: string) {
      if (THEMES_MAP[newThemeName]) {
        this.currentTheme = newThemeName
        this.updateBodyThemeName()
      }
    },

    updateBodyThemeName() {
      document.body.className = document.body.className.replace(
        /\s?theme-[\w-]+/g,
        '',
      )
      document.body.classList.add(`theme-${this.currentTheme}`)
      // 同步给布局（site-container--theme-* 类依赖它）
      bus.setState('theme', this.currentTheme)
    },
  },
})

export default useThemesStore
