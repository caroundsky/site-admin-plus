import { defineConfig } from 'vite'
import path from 'path'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue(), vueJsx(), svgLoader()],

  resolve: {
    alias: {
      '@': '/src',
      '~': '',
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },

  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: `@import "${path.resolve(
          __dirname,
          'src/styles/variables.less'
        )}";`,
      },
    },
  },

  server: {
    port: 8080, // 指定端口号
    host: '0.0.0.0',
    strictPort: false, // 设为 false 时，若端口已被占用则会尝试下一个可用端口,而不是直接退出
    proxy: {
      // 开发者服务地址
      '/proxy': {
        target: 'http://proxy.cn',
        changeOrigin: true,
        rewrite: (url) => url.replace('/proxy', ''),
      },
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },

  define: {
    'process.env': {
      NODE_ENV: process.env.NODE_ENV,
    },
  },

  build: {
    rollupOptions: {
      external: ['vue', 'pinia', 'vue-draggable-plus', 'element-plus'],
    },
    sourcemap: true,
    outDir: 'lib',
    lib: {
      entry: './src/main.ts',
      name: 'lemonAdmin',
      fileName: 'index',
      formats: ['es'],
    },
  },
})
