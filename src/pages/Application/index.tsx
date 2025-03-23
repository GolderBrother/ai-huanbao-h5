import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import StatusBar from '@/components/StatusBar'
import BottomNav from '@/components/BottomNav'
import './index.scss'

interface AppItem {
  id: string
  icon: string
  name: string
  tag: string
  desc: string
  creator: string
  usage: string
  path: string
  iconBg: string
  iconColor: string
}

export default defineComponent({
  name: 'Application',
  setup() {
    const router = useRouter()
    const activeTag = ref('用过')

    const tags = ['用过', '工具提效', '娱乐休闲', '角色闲聊']

    const apps: AppItem[] = [
      {
        id: '1',
        icon: 'fa-search',
        name: 'AI搜索',
        tag: '官方',
        desc: '智能搜索引擎，一键获取你想要的信息',
        creator: '@官方智能体',
        usage: '427.7万次使用',
        path: '/search',
        iconBg: '#e1f5fe',
        iconColor: '#29b6f6'
      },
      {
        id: '2',
        icon: 'fa-book-reader',
        name: 'AI阅读',
        tag: '官方',
        desc: '智能文本分析，帮你理解各种文档内容',
        creator: '@官方智能体',
        usage: '267.3万次使用',
        path: '/pages/reading',
        iconBg: '#e8f5e9',
        iconColor: '#43a047'
      },
      // ... 其他应用项
    ]

    return () => (
      <div class="page-container">
        <StatusBar />
        
        <div class="page-header">
          <a class="back-button" onClick={() => router.back()}>
            <i class="fas fa-chevron-left"></i>
          </a>
          <div class="page-title">AI 应用</div>
        </div>

        <div class="search-bar">
          <i class="fas fa-search"></i>
          <span>搜索应用</span>
        </div>

        <div class="category-tags">
          {tags.map(tag => (
            <div 
              class={`category-tag ${activeTag.value === tag ? 'active' : ''}`}
              onClick={() => activeTag.value = tag}
            >
              {tag}
            </div>
          ))}
        </div>

        <div class="app-list">
          {apps.map(app => (
            <div class="app-item" key={app.id}>
              <div class="app-icon" style={{
                backgroundColor: app.iconBg,
              }}>
                <i class={`fas ${app.icon}`} style={{
                  color: app.iconColor,
                  fontSize: '24px'
                }}></i>
              </div>
              
              <div class="app-info">
                <div class="app-name">
                  {app.name}
                  <span class="app-tag">{app.tag}</span>
                </div>
                <div class="app-desc">{app.desc}</div>
                <div class="app-meta">
                  <i class="fas fa-user"></i>
                  <span class="creator-name">{app.creator}</span>
                  <i class="fas fa-clock"></i>
                  <span class="usage-count">{app.usage}</span>
                </div>
              </div>

              <div 
                class="use-button"
                onClick={() => router.push(app.path)}
              >
                使用
              </div>
            </div>
          ))}
        </div>

        <BottomNav />
      </div>
    )
  }
}) 