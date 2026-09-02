/**
 * 汉字转拼音 + 拼音检索
 *
 * 重构自旧版 ChineseToPinyin_1_0（构造器 + 原型链 → 纯模块函数），检索行为保持一致。
 * 相对旧版的取舍：
 * - 删除无人使用的 HTML 高亮输出（getHtml / className / Division）
 * - 字典中的 \uXXXX 转义还原为字面汉字（见 dict.ts），便于维护
 * - 汉字 -> 读音反查表模块级惰性构建一次，不再随实例重复构建
 * - 字典未收录的汉字保留原字返回（旧版会推入 false，导致后续 substr 报错）
 */
import { MATCHING_TABLE, POLYPHONE_TABLE } from './dict'

export interface ConvertPinyinOptions {
  /** 包含汉字的字符串 */
  chinas: string
  /** 输出数组还是字符串，默认 false（字符串） */
  arr?: boolean
  /** 只输出首字母，默认 false */
  first?: boolean
  /** 首字母大写：first 模式下首字母大写，否则每个读音首字母大写，默认 false */
  firstCapital?: boolean
  /** 字符串输出时带上中文（py:中 形式），默认 false */
  bothShow?: boolean
  /** 传入则在拼音中检索 str，返回匹配到的汉字数组 */
  vals?: { str: string }
}

/** 单字拼音单元：单音字为 string，多音字为候选数组 */
type PinyinCell = string | string[]

const CJK_REG = /[一-龥]/

// 汉字 -> 读音（MATCHING_TABLE 的反查表，惰性构建一次）
let monoMap: Record<string, string> | null = null
const getMonoMap = () => {
  if (!monoMap) {
    monoMap = {}
    for (const pinyin in MATCHING_TABLE) {
      for (const ch of MATCHING_TABLE[pinyin]) {
        monoMap[ch] = monoMap[ch] ? `${monoMap[ch]} ${pinyin}` : pinyin
      }
    }
  }
  return monoMap
}

// 读音格式化：first 取首字母；firstCapital 决定大小写
const formatPinyin = (name: string, first: boolean, firstCapital: boolean) => {
  if (!name) return name
  if (first) return firstCapital ? name[0].toUpperCase() : name[0].toLowerCase()
  return firstCapital
    ? name[0].toUpperCase() + name.slice(1).toLowerCase()
    : name.toLowerCase()
}

// 逐字转换：非汉字原样小写/大写；单音字查反查表；多音字给候选数组；未收录保留原字
const toPinyinCells = (
  chinas: string,
  first: boolean,
  firstCapital: boolean,
): PinyinCell[] => {
  const mono = getMonoMap()
  const cells: PinyinCell[] = []
  for (const ch of chinas) {
    if (!CJK_REG.test(ch)) {
      cells.push(firstCapital ? ch.toUpperCase() : ch.toLowerCase())
      continue
    }
    const monoHit = mono[ch]
    if (monoHit) {
      cells.push(formatPinyin(monoHit, first, firstCapital))
      continue
    }
    const poly = POLYPHONE_TABLE[ch]
    if (poly) {
      cells.push(poly.map((p) => formatPinyin(p, first, firstCapital)))
      continue
    }
    cells.push(ch)
  }
  return cells
}

// 多音字候选选取：全拼匹配取「被 query 包含」的候选；首字母匹配取「首字母出现在 query 中」的候选；否则取第一个
const pickFull = (cell: PinyinCell, query: string) =>
  Array.isArray(cell) ? (cell.find((c) => query.includes(c)) ?? cell[0]) : cell
const pickInitial = (cell: PinyinCell, query: string) =>
  Array.isArray(cell)
    ? (cell.find((c) => query.includes(c[0])) ?? cell[0])
    : cell

// 在拼音中检索 query（须为小写），返回匹配到的汉字（去重）
const matchChinese = (chinas: string, query: string): string[] => {
  if (!query) return []
  const cells = toPinyinCells(chinas, false, false)
  const result = new Set<string>()

  // 全拼匹配（可跨字）：拼接最优候选后查子串，命中区间映射回汉字
  if (query.length > 1) {
    const fullCells = cells.map((c) => pickFull(c, query))
    const fullText = fullCells.join('')
    // 每个字的拼音在 fullText 中的起始偏移
    const offsets: number[] = []
    fullCells.reduce((acc, c) => (offsets.push(acc), acc + c.length), 0)

    let idx = fullText.indexOf(query)
    while (idx !== -1) {
      const end = idx + query.length
      let startChar = 0
      let endChar = cells.length - 1
      for (let c = 0; c < cells.length; c++) {
        if (offsets[c] + fullCells[c].length > idx) {
          startChar = c
          break
        }
      }
      for (let c = cells.length - 1; c >= 0; c--) {
        if (offsets[c] < end) {
          endChar = c
          break
        }
      }
      result.add(chinas.slice(startChar, endChar + 1))
      idx = fullText.indexOf(query, idx + query.length)
    }
  }

  // 首字母匹配（可跨字）：每个字取首字母拼成串，与汉字一一对应
  const initialText = cells.map((c) => pickInitial(c, query)[0]).join('')
  let idx = initialText.indexOf(query)
  while (idx !== -1) {
    result.add(chinas.substr(idx, query.length))
    idx = initialText.indexOf(query, idx + query.length)
  }

  return [...result]
}

/**
 * 汉字转拼音 / 拼音检索
 * - 传 vals：在拼音中检索 vals.str，返回匹配到的汉字数组
 * - 不传 vals：返回拼音（arr 决定数组还是字符串；数组中多音字为候选数组）
 */
export function ConvertPinyin(
  options: ConvertPinyinOptions & { vals: { str: string } },
): string[]
export function ConvertPinyin(
  options: ConvertPinyinOptions & { arr: true },
): PinyinCell[]
export function ConvertPinyin(options: ConvertPinyinOptions): string
export function ConvertPinyin(
  options: ConvertPinyinOptions,
): string | string[] | PinyinCell[] {
  const {
    arr = false,
    first = false,
    firstCapital = false,
    bothShow = false,
  } = options
  const chinas = String(options.chinas).trim()

  // 检索模式
  if (options.vals && typeof options.vals === 'object') {
    return matchChinese(chinas, (options.vals.str || '').toLowerCase())
  }

  // 转换模式
  const cells = toPinyinCells(chinas, first, firstCapital)
  if (arr) {
    return cells
  }
  if (bothShow) {
    return cells
      .map(
        (cell, i) =>
          `${Array.isArray(cell) ? `(${cell.join('-')})` : cell}:${chinas[i]} `,
      )
      .join('')
  }
  return cells
    .map((cell) => (Array.isArray(cell) ? `(${cell.join('-')})` : cell))
    .join('')
}
