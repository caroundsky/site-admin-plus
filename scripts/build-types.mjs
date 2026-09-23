/**
 * 生成发布用的类型声明
 *
 * 为什么需要这一步：
 *   消费方的 TypeScript 会直接解析我们发布的声明。若声明里引用了库的 `.ts` 源码，
 *   TS 会把它们当普通源码做类型检查——而源码内部用的是构建期别名（`@/`），
 *   消费方的别名指向他们自己的 src，必然解析失败。所以改为发布**自包含的 .d.ts**：
 *     - 只发布声明，不发布源码（源码树也不会被生成物污染）
 *     - 生成后再把别名改写成相对路径，关掉 skipLibCheck 的消费方也不会出错
 *
 * 产物：`types/`（镜像 src 结构），入口为 `types/main.d.ts`，由 package.json 的
 * `typings` 指向。
 *
 * 用法：yarn build:types（由 yarn build 自动串联）
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'types')

/* ---------- 1. 用 vue-tsc 产出声明（.vue 也能处理） ---------- */
console.log('[build-types] vue-tsc --emitDeclarationOnly ...')
// 注意用 shell 执行：Windows 上 Node 不允许直接 spawn .cmd
// （node_modules/.bin 里的 vue-tsc 在 Windows 下是 .cmd）
execSync('npx vue-tsc -p tsconfig.dts.json', {
  cwd: ROOT,
  stdio: 'inherit',
  shell: true,
})

/* ---------- 2. 后处理：别名 → 相对路径、删除样式副作用导入 ---------- */
const toPosix = (p) => p.split(path.sep).join('/')

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
let unresolved = 0

for (const file of walk(OUT)) {
  const before = fs.readFileSync(file, 'utf8')
  let code = before

  // 2.1 删除 CSS 副作用导入（如 `import '@/styles/index.scss'`）
  code = code.replace(
    /^\s*import\s+['"][^'"]+\.(css|scss|sass|less|styl)['"];?\s*$/gm,
    () => {
      stripped++
      return ''
    },
  )

  // 2.2 `@/x` → 相对当前文件的路径（产物目录镜像 src，故 @/x 即 <OUT>/x）
  // 三种写法都要覆盖：`from '@/x'`、`import('@/x')`、裸副作用 `import '@/x'`
  code = code.replace(
    /(\bfrom\s+|\bimport\s*\(|\bimport\s+)(['"])@\/([^'"]+)\2/g,
    (_m, prefix, quote, rest) => {
      const target = path.join(OUT, rest)
      let rel = toPosix(path.relative(path.dirname(file), target))
      if (!rel.startsWith('.')) rel = './' + rel
      rewritten++
      return `${prefix}${quote}${rel}${quote}`
    },
  )

  // 2.3 `~/x` 属于仓库根别名，产物里不该出现（源码已统一用 @/）
  if (/(\bfrom\s*|\bimport\s*\()\s*['"]~\//.test(code)) {
    console.warn(`[build-types] 警告：${path.relative(ROOT, file)} 仍含 ~/ 别名`)
    unresolved++
  }

  if (code !== before) fs.writeFileSync(file, code)
}

console.log(
  `[build-types] 完成：改写别名 ${rewritten} 处，移除样式导入 ${stripped} 处` +
    (unresolved ? `，未解析警告 ${unresolved} 处` : ''),
)
