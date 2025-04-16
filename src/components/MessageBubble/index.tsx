import { defineComponent, ref, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { sendChatMessage } from '@/api/chat'
import MarkdownIt from 'markdown-it'
import './index.scss'

export default defineComponent({
  name: 'MessageBubble',
  props: {
    message: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true,
    }
  },
  setup(props) {
    const chatStore = useChatStore()
    const isSpeaking = ref(false)
    const md = new MarkdownIt({
      html: true,
      breaks: true,
      linkify: true,
      typographer: true,
      highlight: function (str, lang) {
        // 这里可以集成代码高亮，比如使用 highlight.js 或 prism
        return `<pre class="language-${lang}"><code>${str}</code></pre>`
      }
    })

    // 修改重新生成回答的逻辑
    const handleRegenerate = async () => {
      // 从当前消息往前找最近的用户消息
      const messages = chatStore.messages
      let userMessageIndex = props.index - 1
      while (userMessageIndex >= 0) {
        if (messages[userMessageIndex].role === 'user') {
          break
        }
        userMessageIndex--
      }

      if (userMessageIndex >= 0) {
        const userMessage = messages[userMessageIndex]
        
        // 将当前 AI 消息设置为加载状态
        chatStore.updateMessage(props.index, {
          ...props.message,
          role: 'assistant',
          content: ''
        })
        
        chatStore.setStreaming(true)
        
        try {
          await sendChatMessage(
            userMessage.content,
            chatStore.currentModel,
            (text) => {
              chatStore.updateMessage(props.index, {
                ...props.message,
                role: 'user',
                content: text
              })
            }
          )
        } catch (error) {
          console.error('重新生成回答失败:', error)
          chatStore.updateMessage(props.index, {
            ...props.message,
            content: '抱歉，重新生成回答时发生错误，请稍后重试。'
          })
        } finally {
          chatStore.setStreaming(false)
        }
      }
    }

    // 复制内容
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(props.message.content)
        // 可以添加一个复制成功的提示
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    // 语音播放
    const handleSpeak = () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
        isSpeaking.value = false
        return
      }

      const utterance = new SpeechSynthesisUtterance(props.message.content)
      utterance.lang = 'zh-CN'
      
      utterance.onend = () => {
        isSpeaking.value = false
      }

      isSpeaking.value = true
      window.speechSynthesis.speak(utterance)
    }

    // 渲染 Markdown 内容
    const renderContent = () => {
      if (props.message.role === 'assistant') {
        return <div 
          class="markdown-body text-left" 
          innerHTML={md.render(props.message.content)}
        />
      }
      return props.message.content
    }

    return () => (
      <div class={`message-bubble ${props.message.role}`}>
        {/* <div class="avatar">
          <img 
            src={props.message.role === 'user' ? '/avatars/user.png' : '/avatars/ai.png'} 
            alt={props.message.role}
          />
        </div> */}
        <div class="content">
          {renderContent()}
          {props.message.role === 'assistant' && (
            <div class="message-actions">
              <button 
                class={`action-btn ${chatStore.isStreaming ? 'disabled' : ''}`}
                onClick={handleRegenerate}
                disabled={chatStore.isStreaming}
              >
                <i class={`fas ${chatStore.isStreaming ? 'fa-spinner fa-spin' : 'fa-rotate-right'}`}></i>
              </button>
              <button class="action-btn" onClick={handleCopy}>
                <i class="fas fa-copy"></i>
              </button>
              <button 
                class={`action-btn ${isSpeaking.value ? 'active' : ''}`} 
                onClick={handleSpeak}
              >
                <i class={`fas ${isSpeaking.value ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }
})
