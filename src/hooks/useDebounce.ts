import { ref, onUnmounted } from 'vue'
import { debounce } from 'lodash-es'

export const useDebounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
) => {
  const timer = ref<number>()

  const debouncedFn = debounce((...args: Parameters<T>) => {
    fn(...args)
  }, delay)

  onUnmounted(() => {
    debouncedFn.cancel()
  })

  return debouncedFn
}