import { defineConfig } from 'vite'
import path from 'path'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import svgLoader from 'vite-svg-loader'

// Sass 的 @use 里不能出现反斜杠（会被当转义字符），Windows 下统一转成正斜杠
const variablesPath = path
  .resolve(import.meta.dirname, 'src/styles/variables.scss')
  .replace(/\\/g, '/')

// 本次构建的目标：容器本体（默认）还是跨 iframe 的业务页 SDK
const isBridgeEntry = process.env.LEMON_ENTRY === 'bridge'

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
      //
      // pinia 必须外置：它是「单例」依赖，内部有模块级的 activePinia 与 piniaSymbol。
      // 一旦被打包进产物，库与宿主就各持一份 pinia 模块，宿主自己的 useXxxStore()
      // 会因查不到 activePinia 而抛错（详见 README 的依赖说明）。
      external: ['vue', 'pinia', /^element-plus(\/|$)/, /^lodash(\/|$)/],
    },
    sourcemap: true,
    outDir: 'lib',
    // 第二次构建（bridge）不能清空 lib，否则会把容器产物抹掉
    emptyOutDir: !isBridgeEntry,
    lib: {
      // 入口由 LEMON_ENTRY 决定，两次单入口构建，见 scripts/build-lib.mjs。
      // 不用 Vite 的多入口：多入口会把共享模块抽成**带 hash 的公共 chunk**
      // （实测生成了 protocol-XXXX.js），bridge.js 就不再自包含、文件名也不稳定，
      // 而它是要被任意技术栈的 iframe 页面单独引入的。
      entry: isBridgeEntry ? './src/bridge.ts' : './src/main.ts',
      name: 'lemonAdmin',
      fileName: isBridgeEntry ? 'bridge' : 'index',
      // 多入口时 CSS 会按 lib.name 命名（lemon-admin.css），
      // 而消费方一直 import 的是 lib/index.css，这里固定住不变
      cssFileName: 'index',
      formats: ['es'],
    },
  },
}))
