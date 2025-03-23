import request from './request'
import type { UserInfo } from '@/types'

export const login = (data: { username: string; password: string }) => {
  return request.post<{ token: string; userInfo: UserInfo }>('/api/login', data)
}

export const getUserInfo = () => {
  return request.get<UserInfo>('/api/user/info')
}

export const updateUserInfo = (data: Partial<UserInfo>) => {
  return request.put('/api/user/info', data)
}