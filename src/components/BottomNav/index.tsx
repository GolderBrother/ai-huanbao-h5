import { defineComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import './index.scss'

export default defineComponent({
  name: 'BottomNav',
  setup() {
    const router = useRouter()
    const route = useRoute()

    const navItems = [
      { icon: 'fas fa-comment-dots', text: '对话', path: '/home' },
      { icon: 'fas fa-edit', text: '创作', path: '/creation' },
      { icon: 'fas fa-border-all', text: '应用', path: '/application' },
      { icon: 'far fa-user', text: '我的', path: '/profile' }
    ]

    return () => (
      <div class="bottom-nav">
        {navItems.map(item => (
          <div
            class={`nav-item ${route.path === item.path ? 'active' : ''}`}
            onClick={() => router.push(item.path)}
          >
            <i class={item.icon}></i>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    )
  }
}) 