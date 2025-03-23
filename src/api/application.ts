import request from './request'
import type { AppItem } from '@/types'

export const getAppList = (category?: string) => {
  return request.get<AppItem[]>('/api/application/list', {
    params: { category }
  })
}

export const searchApps = (keyword: string) => {
  return request.get<AppItem[]>('/api/application/search', {
    params: { keyword }
  })
}