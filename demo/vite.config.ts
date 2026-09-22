import { defineConfig } from 'vite'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
// https://github.com/element-plus/unplugin-element-plus
import ElementPlus from 'unplugin-element-plus/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      imports: ['vue', 'vue-router'],
      dts: 'types/auto-import.d.ts',
      resolvers: [ElementPlusResolver()],
    }),
    ElementPlus({
      useSource: false,
    }),
    Components({
      dts: 'types/components.d.ts',
      resolvers: [ElementPlusResolver()],
    }),
  ],

  resolve: {
    alias: {
      '@': '/src',
      '~': './',
    },
  },

  css: {},

  build: {
    rollupOptions: {
      output: {
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
      },
    },
  },

  server: {
    port: 8080, // 指定端口号
    strictPort: false, // 设为 false 时，若端口已被占用则会尝试下一个可用端口,而不是直接退出
    proxy: {
      // 开发者服务地址
      '/proxy': {
        target: 'http://proxy.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace('/proxy', ''),
      },
    },
  },
})
