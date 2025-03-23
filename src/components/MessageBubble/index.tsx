import { defineComponent, PropType } from 'vue'
import { ChatMessage } from '@/types'
import './index.scss'

export default defineComponent({
  name: 'MessageBubble',
  props: {
    message: {
      type: Object as PropType<ChatMessage>,
      required: true
    }
  },
  setup(props) {
    return () => (
      <div class={`message-bubble ${props.message.role}`}>
        <div class="avatar">
          <img 
            src={props.message.role === 'user' ? '/user-avatar.png' : '/ai-avatar.png'} 
            alt={props.message.role}
          />
        </div>
        <div class="content">
          {props.message.content}
        </div>
      </div>
    )
  }
})