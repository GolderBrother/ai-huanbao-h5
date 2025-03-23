import request from './request'
import type { SearchResult, HotSearch } from '@/types'

export const search = (keyword: string, type: string) => {
  return request.get<SearchResult[]>('/api/search', {
    params: { keyword, type }
  })
}

export const getHotSearches = () => {
  return request.get<HotSearch[]>('/api/search/hot')
}