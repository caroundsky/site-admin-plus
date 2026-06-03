import { defineStore } from 'pinia'

interface UserInfo {
  userId: string
  oaId: string
  username: string
  employeeName: string
  avatar: string
  email: string
}

interface State {
  userInfo: UserInfo | {}
}

export const useUserStore = defineStore('user', {
  state: (): State => ({
    userInfo: {},
  }),

  getters: {
    getUserInfo: (state) => state.userInfo,
  },

  actions: {
    initUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
    },
  },
})

export default useUserStore
