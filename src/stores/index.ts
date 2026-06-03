import { createPinia } from 'pinia'

export const pinia = createPinia()

export { useAppStore } from './app'
export { useMenuStore } from './menu'
export { useMenuViewsStore } from './menuViews'
