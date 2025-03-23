import { defineComponent } from 'vue'
import './index.scss'

export default defineComponent({
  name: 'Loading',
  props: {
    text: {
      type: String,
      default: '加载中...'
    }
  },
  setup(props) {
    return () => (
      <div class="loading-container">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <p>{props.text}</p>
      </div>
    )
  }
})