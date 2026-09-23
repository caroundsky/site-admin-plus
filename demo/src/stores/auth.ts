/**
 * 登录态（演示用：纯前端模拟，不调任何接口）
 *
 * 原先这里调 `@/api/main` 的 /getUser 接口，本案例改为前端模拟，
 * `src/api/` 那套请求封装保留但不再参与登录流程。
 */
import { defineStore } from 'pinia'
import { bus } from '@caroundsky/lemon-admin'

/** 演示账号 */
export const MOCK_ACCOUNT = {
  username: 'admin',
  password: '123456',
}

const STORAGE_KEY = 'demo:currentUser'

export interface CurrentUser {
  name?: string
}

const readCache = (): CurrentUser => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export const authStore = defineStore('authInfo', {
  state: () => ({
    currentUser: readCache(),
    loading: false,
  }),

  getters: {
    loggedIn: (state) => Object.keys(state.currentUser).length !== 0,
  },

  actions: {
    /** 模拟登录：延迟 500ms 后校验演示账号 */
    async login(username: string, password: string) {
      this.loading = true
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (
          username !== MOCK_ACCOUNT.username ||
          password !== MOCK_ACCOUNT.password
        ) {
          throw new Error('用户名或密码错误')
        }
        this.currentUser = { name: username }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUser))
        // 告诉站点容器当前用户是谁：此后它写入的本地缓存都会带 `<用户名>/` 前缀，
        // 换账号登录不会串数据
        bus.setUserKey(username)
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.currentUser = {}
      localStorage.removeItem(STORAGE_KEY)
      // 库收到 logout 会清掉该用户命名空间下的全部缓存
      bus.emit('logout')
    },
  },
})
