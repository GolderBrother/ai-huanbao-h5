import request from './request'
import type { CreationItem } from '@/types'

export const getCreationList = (type: 'image' | 'video' | 'writing') => {
  return request.get<CreationItem[]>(`/api/creation/list/${type}`)
}

export const createContent = (data: {
  type: 'image' | 'video' | 'writing'
  prompt: string
  style?: string
  size?: string
}) => {
  return request.post('/api/creation/generate', data)
}