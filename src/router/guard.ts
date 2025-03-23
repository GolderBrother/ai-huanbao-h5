import { type Router } from 'vue-router'

export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    // 暂时移除登录验证逻辑
    next()
  })
}