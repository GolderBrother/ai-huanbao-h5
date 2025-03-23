import { defineComponent, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import './index.scss'

export default defineComponent({
  name: 'StatusBar',
  setup() {
    const time = ref(dayjs().format('HH:mm'))

    onMounted(() => {
      setInterval(() => {
        time.value = dayjs().format('HH:mm')
      }, 1000)
    })

    return () => (
      <div class="status-bar">
        <div class="status-bar-left">
          <span class="status-bar-time">{time.value}</span>
        </div>
        <div class="status-bar-right">
          <i class="fas fa-signal"></i>
          <i class="fas fa-wifi"></i>
          <i class="fas fa-battery-three-quarters"></i>
        </div>
      </div>
    )
  }
}) 