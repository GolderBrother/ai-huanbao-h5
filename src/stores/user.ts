import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/types'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string | null>(null)
  const isVip = ref(false)

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
    isVip.value = info.isVip
  }

  function setToken(newToken: string) {
    token.value = newToken
  }

  function logout() {
    userInfo.value = null
    token.value = null
    isVip.value = false
  }

  return {
    userInfo,
    token,
    isVip,
    setUserInfo,
    setToken,
    logout
  }
}, {
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['token']
  }
})