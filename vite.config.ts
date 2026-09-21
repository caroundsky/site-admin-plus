import { defineConfig } from 'vite'
import path from 'path'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import svgLoader from 'vite-svg-loader'

// Sass 的 @use 里不能出现反斜杠（会被当转义字符），Windows 下统一转成正斜杠
const variablesPath = path
  .resolve(import.meta.dirname, 'src/styles/variables.scss')
  .replace(/\\/g, '/')

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: './',
  plugins: [vue(), vueJsx(), svgLoader()],

  resolve: {
    alias: {
      // 让 example 用真实包名导入，与消费方写法完全一致；
      // 要改成构建产物，只需把这里指向 lib/index.js。
      '@caroundsky/lemon-admin': path.resolve(import.meta.dirname, 'src/main.ts'),
      '@': '/src',
      '~': '',
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },

  css: {
    preprocessorOptions: {
      // 把全局变量与混入注入到每个 scss 编译单元。
      // 注意：@use 只作用于被 Vite 直接处理的入口，由 Sass 自身 @use 加载的
      // 部分文件（如 navMenu.scss）需自行引入 variables。
      scss: {
        additionalData: `@use "${variablesPath}" as *;`,
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
    // 必须用精确键 + 字符串值。
    // 写成 `'process.env': { NODE_ENV: ... }` 会把 process.env 整体替换成对象字面量，
    // 而 `process.env.NODE_ENV` 这类成员访问无法被静态折叠，导致依赖（pinia 等）里
    // 受 `process.env.NODE_ENV` 守卫的 dev 分支（devtools 接线、开发期告警）
    // 整段留在产物中 —— 实测会让 lib/index.js 多出 95 KB。
    // 按 command 显式区分，不依赖 Vite 内部是否设置该环境变量。
    'process.env.NODE_ENV': JSON.stringify(
      command === 'build' ? 'production' : 'development',
    ),
  },

  build: {
    // Vite 8：rollupOptions 已更名为 rolldownOptions
    rolldownOptions: {
      // element-plus / lodash 用前缀正则而非精确字符串：
      // 否则 element-plus/es/... 这类深路径导入不会被外置，会把库内部模块打进产物。
      // lodash 是逐函数导入（lodash/debounce 等），同理。
      external: ['vue', /^element-plus(\/|$)/, /^lodash(\/|$)/],
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
}))
