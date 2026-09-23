/**
 * 本地缓存封装（localStorage）
 *
 * 约定：
 *  - key 统一为 `{用户标识}/SiteContainer/{名称}`。带用户标识是为了隔离多账号——
 *    同一浏览器换账号登录时，不会读到上一个账号的菜单开关、搜索历史等。
 *  - 每条记录带写入时间，读取时超过 {@link MAX_AGE} 视为失效并清除。
 *  - 退出登录（`setStorageUserKey(null)`）时清掉该用户命名空间下的全部缓存。
 *
 * 这里不 import bus，避免 bus → storage → bus 的循环依赖；
 * bus 的 `userKey` / `setUserKey` 是对本模块的单向委托。
 */

/** key 中的固定段 */
const NAMESPACE = 'SiteContainer'

/** 过期时间：一周 */
export const MAX_AGE = 7 * 24 * 60 * 60 * 1000

/** 用户标识自身的存放位置（不参与命名空间，否则就成了自引用） */
const USER_KEY_STORAGE = 'SiteContainer/userKey'

/**
 * 当前用户标识。
 *
 * 这里**落盘并在模块初始化时恢复**：宿主通常要等接口返回才知道用户是谁（异步），
 * 而菜单等数据在容器挂载时就要读缓存。若只存在内存里，刷新后会先按「无命名空间」
 * 读一次、之后又按用户命名空间写，读写的 key 对不上，表现为「切了开关一刷新就还原」。
 */
let currentUserKey = (() => {
  try {
    return localStorage.getItem(USER_KEY_STORAGE) || ''
  } catch {
    return ''
  }
})()

export const getStorageUserKey = () => currentUserKey

/** 设置当前登录用户标识；传 `null`/空串表示退出登录，会清掉该用户的缓存 */
export const setStorageUserKey = (key: string | null) => {
  const previous = currentUserKey
  currentUserKey = key || ''

  try {
    if (currentUserKey) localStorage.setItem(USER_KEY_STORAGE, currentUserKey)
    else localStorage.removeItem(USER_KEY_STORAGE)
  } catch {
    /* 忽略 */
  }

  if (!currentUserKey && previous) clearUserStorage(previous)
}

/** 拼出完整的 storage key */
export const buildKey = (name: string, userKey = currentUserKey) =>
  [userKey, NAMESPACE, name].filter(Boolean).join('/')

interface Boxed<T> {
  v: T
  t: number
}

const isBoxed = (value: unknown): value is Boxed<unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  'v' in value &&
  't' in value

export function readStorage<T>(name: string): T | null {
  try {
    const raw = localStorage.getItem(buildKey(name))
    if (raw === null) return null

    const parsed: unknown = JSON.parse(raw)

    // 兼容早期直接存值的旧数据
    if (!isBoxed(parsed)) return parsed as T

    if (Date.now() - parsed.t > MAX_AGE) {
      removeStorage(name)
      return null
    }
    return parsed.v as T
  } catch {
    return null
  }
}

export function writeStorage(name: string, value: unknown): void {
  try {
    const boxed: Boxed<unknown> = { v: value, t: Date.now() }
    localStorage.setItem(buildKey(name), JSON.stringify(boxed))
  } catch {
    // localStorage 可能被禁用或写满，静默失败即可
  }
}

export function removeStorage(name: string): void {
  try {
    localStorage.removeItem(buildKey(name))
  } catch {
    /* 忽略 */
  }
}

/** 清除某个用户命名空间下的全部缓存；不传参数时清当前用户 */
export function clearUserStorage(userKey = currentUserKey): void {
  if (!userKey) return
  const prefix = `${userKey}/${NAMESPACE}/`

  try {
    const matched: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) matched.push(key)
    }
    matched.forEach((key) => localStorage.removeItem(key))
  } catch {
    /* 忽略 */
  }
}
