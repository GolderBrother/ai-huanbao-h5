import { ref } from 'vue'

export const useLoading = (initialState = false) => {
  const isLoading = ref(initialState)

  const startLoading = () => {
    isLoading.value = true
  }

  const stopLoading = () => {
    isLoading.value = false
  }

  const withLoading = async <T>(promise: Promise<T>): Promise<T> => {
    try {
      startLoading()
      return await promise
    } finally {
      stopLoading()
    }
  }

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  }
}