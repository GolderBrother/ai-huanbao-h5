import { type Router } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/constants'

const whiteList = ['/login', '/register', '/forgot-password']

export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const token = storage.get(STORAGE_KEYS.TOKEN)

    if (token) {
      if (to.path === '/login') {
        next({ path: '/' })
      } else {
        if (!userStore.userInfo) {
          try {
            // 获取用户信息
            await userStore.getUserInfo()
            next()
          } catch (error) {
            // token 失效，重新登录
            userStore.logout()
            next(`/login?redirect=${to.path}`)
          }
        } else {
          next()
        }
      }
    } else {
      if (whiteList.includes(to.path)) {
        next()
      } else {
        next(`/login?redirect=${to.path}`)
      }
    }
  })
}