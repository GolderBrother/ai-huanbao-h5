import { defineComponent, ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { sendChatMessage } from '@/api/chat'
import StatusBar from '@/components/StatusBar'
import BottomNav from '@/components/BottomNav'
import MessageBubble from '@/components/MessageBubble'
import { AI_MODELS } from '@/constants'
import './index.scss'

export default defineComponent({
  name: 'Home',
  setup() {
    const chatStore = useChatStore()
    const inputMessage = ref('')
    const messageListRef = ref<HTMLDivElement>()

    const scrollToBottom = () => {
      setTimeout(() => {
        if (messageListRef.value) {
          messageListRef.value.scrollTop = messageListRef.value.scrollHeight
        }
      }, 100)
    }

    const handleSend = async () => {
      if (!inputMessage.value.trim() || chatStore.isStreaming) return

      const userMessage = {
        role: 'user',
        content: inputMessage.value
      }
      chatStore.addMessage(userMessage)
      inputMessage.value = ''
      scrollToBottom()

      chatStore.setStreaming(true)
      const aiMessage = {
        role: 'assistant',
        content: ''
      }
      chatStore.addMessage(aiMessage)

      try {
        await sendChatMessage(
          userMessage.content,
          chatStore.currentModel,
          (text) => {
            chatStore.updateLastMessage(text)
            scrollToBottom()
          }
        )
      } catch (error) {
        console.error('发送消息失败:', error)
        chatStore.updateLastMessage('抱歉，发生了一些错误，请稍后重试。')
      } finally {
        chatStore.setStreaming(false)
        scrollToBottom()
      }
    }

    return () => (
      <div class="page-container">
        <StatusBar />
        
        <div class="chat-header">
          <div class="model-selector">
            <span class="current-model">{chatStore.currentModel}</span>
            <i class="fas fa-chevron-down"></i>
          </div>
        </div>

        <div class="message-list" ref={messageListRef}>
          {chatStore.messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
        </div>

        <div class="input-area">
          <div class="input-box">
            <textarea
              v-model={inputMessage.value}
              placeholder="输入消息..."
              onKeypress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <button 
              class={`send-btn ${chatStore.isStreaming ? 'disabled' : ''}`}
              onClick={handleSend}
              disabled={chatStore.isStreaming}
            >
              <i class={`fas ${chatStore.isStreaming ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    )
  }
})