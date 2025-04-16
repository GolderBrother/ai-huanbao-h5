import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatMessage } from '@/types'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const currentModel = ref('HUNYUAN')
  const isStreaming = ref(false)

  function addMessage(message: ChatMessage) {
    messages.value.push(message)
  }

  function updateLastMessage(content: string) {
    if (messages.value.length > 0) {
      messages.value[messages.value.length - 1].content = content
    }
  }

  function setStreaming(status: boolean) {
    isStreaming.value = status
  }

  function setCurrentModel(model: string) {
    currentModel.value = model
  }

  function updateMessage(index: number, message: ChatMessage) {
    messages.value[index] = message
  }

  return {
    messages,
    currentModel,
    isStreaming,
    addMessage,
    updateLastMessage,
    setStreaming,
    setCurrentModel,
    updateMessage
  }
})