import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import './index.scss'

export default defineComponent({
  name: 'NotFound',
  setup() {
    const router = useRouter()

    const goHome = () => {
      router.replace('/')
    }

    return () => (
      <div class="not-found">
        <div class="content">
          <i class="fas fa-exclamation-circle"></i>
          <h1>404</h1>
          <p>抱歉，您访问的页面不存在</p>
          <button onClick={goHome}>返回首页</button>
        </div>
      </div>
    )
  }
}) 