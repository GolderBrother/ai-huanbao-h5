import { defineComponent } from 'vue'
import './index.scss'

export default defineComponent({
  name: 'Empty',
  props: {
    text: {
      type: String,
      default: '暂无数据'
    },
    icon: {
      type: String,
      default: 'inbox'
    }
  },
  setup(props) {
    return () => (
      <div class="empty-container">
        <i class={`fas fa-${props.icon}`}></i>
        <p>{props.text}</p>
      </div>
    )
  }
})