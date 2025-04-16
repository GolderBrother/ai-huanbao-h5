import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { sendChatMessage } from '@/api/chat'
import StatusBar from '@/components/StatusBar'
import BottomNav from '@/components/BottomNav'
import MessageBubble from '@/components/MessageBubble'
import { AI_MODELS } from '@/constants'
import type { AIModel } from '@/types'
import './index.scss'
import { useRouter } from 'vue-router'
import type { SpeechRecognition, SpeechRecognitionErrorEvent, SpeechRecognitionEvent } from '@/types/speech'
import { TOOL_OPTIONS } from '@/config'
import { TOOL_OPTIONS_CONFIG } from '@/constants'

export default defineComponent({
  name: 'Home',
  setup() {
    const chatStore = useChatStore()
    const router = useRouter()
    const inputMessage = ref('')
    const messageListRef = ref<HTMLDivElement>()
    const imagePreviewRef = ref<HTMLImageElement>()
    const fileInputRef = ref<HTMLInputElement>()
    const showImagePreview = ref(false)
    const selectedImage = ref('')
    // 修改 activeToolOption 的类型
    const activeToolOption = ref<string[]>([]);
    const recognition = ref<SpeechRecognition | null>(null)
    const isVoiceListening = ref(false)

    const scrollToBottom = () => {
      setTimeout(() => {
        if (messageListRef.value) {
          messageListRef.value.scrollTop = messageListRef.value.scrollHeight
        }
      }, 100)
    }

    const handleModelChange = (model: AIModel) => {
      chatStore.setCurrentModel(model)
    }

    const suggestionQuestions = [
      '为什么成年人比小孩更害怕犯错？',
      '流行文化是否正在消解经典艺术的价值？',
      '打哈欠传染给狗，是因为宠物真懂人类情绪吗？'
    ]

    const handleSuggestionClick = (question: string) => {
      inputMessage.value = question
      handleSend()
    }

    const handleImageUpload = (event: Event) => {
      const input = event.target as HTMLInputElement
      if (input.files && input.files[0]) {
        const reader = new FileReader()
        reader.onload = (e) => {
          selectedImage.value = e.target?.result as string
          showImagePreview.value = true
        }
        reader.readAsDataURL(input.files[0])
      }
    }

    const deleteImage = () => {
      selectedImage.value = ''
      showImagePreview.value = false
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
    }

    const handleSend = async () => {
      if ((!inputMessage.value.trim() && !selectedImage.value) || chatStore.isStreaming) return

      const content = selectedImage.value
        ? `[图片]\n${inputMessage.value}`
        : inputMessage.value

      const userMessage = {
        role: 'user' as const,
        content
      }
      chatStore.addMessage(userMessage)
      inputMessage.value = ''
      deleteImage()
      scrollToBottom()

      chatStore.setStreaming(true)
      const aiMessage = {
        role: 'assistant' as const,
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

    const handleToolOptionClick = (toolName: string) => {
      // 这三个工具可以同时高亮
      const multiHighlightTools = [
        TOOL_OPTIONS.DEEP_THINKING,
        TOOL_OPTIONS.WEB_SEARCH,
        TOOL_OPTIONS.TRUSTED_SEARCH
      ];
      
      if (multiHighlightTools.includes(toolName)) {
        // 切换高亮状态
        const index = activeToolOption.value.indexOf(toolName);
        if (index === -1) {
          activeToolOption.value.push(toolName);
        } else {
          activeToolOption.value.splice(index, 1);
        }
      } else {
        // 其他工具点击后清空高亮
        activeToolOption.value = [];
      }

      const previousModel = chatStore.currentModel
      let newModel: AIModel | string = previousModel

      if (toolName === TOOL_OPTIONS.DEEP_THINKING) {
        newModel = TOOL_OPTIONS.DEEP_THINKING
      } else if (toolName === TOOL_OPTIONS.WEB_SEARCH) {
        newModel = TOOL_OPTIONS.WEB_SEARCH
      } else if (toolName === TOOL_OPTIONS.TRUSTED_SEARCH) {
        newModel = TOOL_OPTIONS.TRUSTED_SEARCH
      } else if (toolName === TOOL_OPTIONS.PHOTO_ANSWER) {
        fileInputRef.value?.click()
        return
      } else if (toolName === TOOL_OPTIONS.SEE_FOR_ME) {
        router.push('/see-for-me')
        return
      }

      if (previousModel !== newModel) {
        const systemMessage = {
          role: 'assistant' as const,
          content: `已切换到 ${newModel} 模型，对话继续进行...`
        }
        chatStore.addMessage(systemMessage)
        chatStore.setCurrentModel(newModel as AIModel)
        scrollToBottom()
      }
    }

    const initSpeechRecognition = () => {
      if ('webkitSpeechRecognition' in window) {
        recognition.value = new (window as any).webkitSpeechRecognition()
        if (!recognition.value) return

        recognition.value.continuous = false
        recognition.value.interimResults = true
        recognition.value.lang = 'zh-CN'

        recognition.value.onstart = () => {
          isVoiceListening.value = true
          inputMessage.value = ''
        }

        recognition.value.onend = () => {
          isVoiceListening.value = false
        }

        recognition.value.onresult = (event: SpeechRecognitionEvent) => {
          const results = event.results[event.results.length - 1]
          if (results.isFinal) {
            const result = results[0].transcript.trim();
            inputMessage.value = result;
            // 如果需要自动发送语音识别的内容,取消下面的注释
            // handleSend()
          }
        }

        recognition.value.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('语音识别错误:', event.error)
          isVoiceListening.value = false
        }
      }
    }

    const handleVoiceButtonClick = () => {
      if (!recognition.value) {
        console.warn('该浏览器不支持语音识别功能')
        return
      }

      if (!isVoiceListening.value) {
        // 开始录音
        try {
          recognition.value.start()
          isVoiceListening.value = true
        } catch (error) {
          console.error('启动语音识别失败:', error)
        }
      } else {
        // 停止录音
        recognition.value.stop()
        isVoiceListening.value = false
      }
    }

    onMounted(() => {
      initSpeechRecognition()
    })

    onUnmounted(() => {
      if (recognition.value && isVoiceListening.value) {
        recognition.value.stop()
      }
    })

    const voiceButton = (
      <button
        class={`action-button ${isVoiceListening.value ? 'active' : ''}`}
        onClick={handleVoiceButtonClick}
      >
        <i class={`fas fa-${isVoiceListening.value ? 'microphone-slash' : 'microphone'}`}></i>
      </button>
    )

    return () => (
      <div class="page-container !w-full">
        <StatusBar />

        {/* 头部 */}
        <div class="home-header">
          <div class="home-title">
            元宝
            <div class="model-selector">
              <select
                value={chatStore.currentModel}
                onChange={(e) => handleModelChange(e.target.value as AIModel)}
                class="home-title-model"
              >
                {Object.values(AI_MODELS).map((model) => (
                  <option value={model.value} key={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div class="home-actions">
            <div class="action-icon">
              <i class="fas fa-phone"></i>
            </div>
            <div class="action-icon">
              <i class="fas fa-share-square"></i>
            </div>
          </div>
        </div>

        {/* 聊天区域 */}
        <div class="chat-container" ref={messageListRef}>
          <div class="message-container">
            {chatStore.messages.length === 0 ? (
              // 当没有消息时显示欢迎信息和建议问题
              <>
                <div class="welcome-message">Hi~ 我是元宝</div>
                <div class="message message-ai">
                  你身边的智能助手，可以为你答疑解惑、尽情创作，快来点击以下任一功能体验吧 ~
                </div>
                <div class="suggestion-chips">
                  {suggestionQuestions.map((question, index) => (
                    <div
                      key={index}
                      class="suggestion-chip"
                      onClick={() => handleSuggestionClick(question)}
                    >
                      {question}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // 当有消息时只显示消息列表
              chatStore.messages.map((message, index) => (
                <MessageBubble
                  key={index}
                  message={message}
                  index={index}
                />
              ))
            )}
          </div>
        </div>

        {/* 对话输入区 */}
        <div class="chat-input-area">
          {/* 图片预览区域 */}
          {showImagePreview.value && (
            <div class="image-preview-area">
              <div class="image-preview-container">
                <img
                  ref={imagePreviewRef}
                  class="image-preview"
                  src={selectedImage.value}
                  alt="预览图片"
                />
                <div class="delete-image" onClick={deleteImage}>
                  <i class="fas fa-times"></i>
                </div>
              </div>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

          <div class="input-container">
            <div class="tools-row">
              {TOOL_OPTIONS_CONFIG.map((tool) => (
                <div
                  key={tool.key}
                  class={`tool-option ${tool.className} ${
                    activeToolOption.value.includes(tool.key) ? 'active' : ''
                  }`}
                  onClick={() => handleToolOptionClick(tool.key)}
                >
                  <i class={`fas ${tool.icon}`}></i>
                  <span>{tool.label}</span>
                </div>
              ))}
            </div>

            <div class="input-row">
              <textarea
                v-model={inputMessage.value}
                class="chat-input-box"
                placeholder={isVoiceListening.value ? '正在聆听...' : '有问题，尽管问'}
                onKeypress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
              <div class="action-buttons">
                <button
                  class={`action-button ${chatStore.isStreaming ? 'disabled' : ''}`}
                  onClick={handleSend}
                  disabled={chatStore.isStreaming}
                >
                  <i class={`fas ${chatStore.isStreaming ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                </button>
                {voiceButton}
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }
})