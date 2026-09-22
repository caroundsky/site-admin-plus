/**
 * 生成发布用的类型声明
 *
 * 为什么需要这一步：
 *   发布的 `types/index.d.ts` 里用相对路径引用了库源码（`../src/bus` 等）。
 *   如果消费方拿到的是 `.ts` 源码，TypeScript 会把它当普通源码做类型检查——
 *   而源码内部用的是本仓库别名（`@/`、`~/`），消费方的别名指向他们自己的 src，
 *   必然解析失败，报一堆 "Cannot find module '@/xxx'"。
 *
 *   在源码旁生成同名 `.d.ts` 后：
 *     1. TypeScript 优先采用 `.d.ts` 而非 `.ts`；
 *     2. `.d.ts` 会被 `skipLibCheck` 跳过，不再对消费方报错。
 *
 * 本脚本负责把生成产物里的别名改写成相对路径、并删除 CSS 副作用导入，
 * 这样即便消费方关掉了 skipLibCheck 也不会出错。
 *
 * 用法：yarn build:types（由 yarn build 自动串联）
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'src')

/* ---------- 1. 用 vue-tsc 产出声明（.vue 也能处理） ---------- */
console.log('[build-types] vue-tsc --emitDeclarationOnly ...')
// 注意用 shell 执行：Windows 上 Node 不允许直接 spawn .cmd
// （node_modules/.bin 里的 vue-tsc 在 Windows 下是 .cmd）
execSync('npx vue-tsc -p tsconfig.dts.json', {
  cwd: ROOT,
  stdio: 'inherit',
  shell: true,
})

/* ---------- 2. 后处理 ---------- */
const toPosix = (p) => p.split(path.sep).join('/')

/** 源文件里不允许出现的同名 .d.ts（手写的，不能被生成物覆盖） */
const HAND_WRITTEN = new Set(
  ['env.d.ts', 'shims-tsx.d.ts'].map((f) => path.join(SRC, f)),
)

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.name.endsWith('.d.ts')) out.push(full)
  }
  return out
}

let rewritten = 0
let stripped = 0

for (const file of walk(SRC)) {
  if (HAND_WRITTEN.has(file)) continue

  const before = fs.readFileSync(file, 'utf8')
  let code = before

  // 2.1 删除 CSS 副作用导入（如 `import '@/styles/index.scss'`）
  code = code.replace(/^\s*import\s+['"][^'"]+\.(css|scss|sass|less|styl)['"];?\s*$/gm, () => {
    stripped++
    return ''
  })

  // 2.2 别名 → 相对路径
  code = code.replace(
    /(\bfrom\s*|\bimport\s*\()\s*(['"])(@|~)\/([^'"]+)\2/g,
    (_m, prefix, quote, alias, rest) => {
      const target = alias === '@' ? path.join(SRC, rest) : path.join(ROOT, rest)
      let rel = toPosix(path.relative(path.dirname(file), target))
      if (!rel.startsWith('.')) rel = './' + rel
      rewritten++
      return `${prefix}${quote}${rel}${quote}`
    },
  )

  if (code !== before) fs.writeFileSync(file, code)
}

console.log(
  `[build-types] 完成：改写别名 ${rewritten} 处，移除样式导入 ${stripped} 处`,
)
