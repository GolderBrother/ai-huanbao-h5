import { ref, watch } from 'vue'
import { storage } from '@/utils/storage'

export const useTheme = () => {
  const theme = ref(storage.get('theme') || 'light')

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    storage.set('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  const initTheme = () => {
    setTheme(theme.value)
  }

  watch(theme, (newTheme) => {
    setTheme(newTheme)
  })

  return {
    theme,
    setTheme,
    toggleTheme,
    initTheme
  }
}