import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

export const formatTime = {
  fromNow(date: string | number): string {
    return dayjs(date).fromNow()
  },

  format(date: string | number, template = 'YYYY-MM-DD HH:mm:ss'): string {
    return dayjs(date).format(template)
  },

  duration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

export const formatNumber = {
  toThousands(num: number): string {
    return num.toLocaleString('zh-CN')
  },

  toShort(num: number): string {
    if (num < 1000) return String(num)
    if (num < 10000) return (num / 1000).toFixed(1) + 'k'
    return (num / 10000).toFixed(1) + 'w'
  }
}