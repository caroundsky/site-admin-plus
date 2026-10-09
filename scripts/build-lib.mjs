/**
 * 分两次构建 lib/：
 *   1. 容器本体 → index.js + index.css
 *   2. 业务页 SDK → bridge.js（零运行时依赖、自包含）
 *
 * 为什么不用 Vite 的多入口：多入口会把两个入口共享的模块抽成**带 hash 的公共
 * chunk**（实测生成了 protocol-XXXX.js）。而 bridge.js 是要被任意技术栈的 iframe
 * 页面单独引入的 —— 它必须自包含、文件名必须稳定，否则业务页要么加载不了，
 * 要么每次发版都得跟着改路径。
 *
 * 两次都是单入口构建，产物天然自包含；第一次清空 lib/，第二次保留。
 *
 * 用法：yarn build（由 package.json 的 build 串联，在 build:types 之后）
 */
import { execSync } from 'node:child_process'

const run = (entry) => {
  console.log(`[build-lib] vite build (LEMON_ENTRY=${entry}) ...`)
  execSync('npx vite build', {
    stdio: 'inherit',
    // Windows 上 Node 不允许直接 spawn .cmd，必须过 shell
    shell: true,
    env: { ...process.env, LEMON_ENTRY: entry },
  })
}

run('container')
run('bridge')
