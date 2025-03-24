import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { setupRouterGuard } from './guard'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home'
  },
  // {
  //   path: '/login',
  //   component: () => import('@/pages/Login')
  // },
  {
    path: '/home',
    component: () => import('@/pages/Home'),
    meta: { requiresAuth: true }
  },
  {
    path: '/creation',
    component: () => import('@/pages/Creation'),
    meta: { requiresAuth: true }
  },
  {
    path: '/application',
    component: () => import('@/pages/Application'),
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    component: () => import('@/pages/Search'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    component: () => import('@/pages/Profile'),
    meta: { requiresAuth: true }
  },
  {
    path: '/see-for-me',
    component: () => import('@/pages/SeeForMe'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/pages/Exception/404')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

setupRouterGuard(router)

export default router