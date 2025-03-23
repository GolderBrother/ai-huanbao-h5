import { defineComponent, ref } from 'vue'
import StatusBar from '@/components/StatusBar'
import BottomNav from '@/components/BottomNav'
import './index.scss'

interface CreationItem {
  id: string
  type: 'image' | 'video' | 'writing'
  title: string
  desc?: string
  coverUrl?: string
  creator: {
    name: string
    avatar: string
  }
  usage: string
}

export default defineComponent({
  name: 'Creation',
  setup() {
    const activeTab = ref<'image' | 'video' | 'writing'>('video')

    const imageItems: CreationItem[] = [
      {
        id: '1',
        type: 'image',
        title: '可爱猫咪',
        coverUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6',
        creator: {
          name: '@D立方Lab',
          avatar: 'D'
        },
        usage: '1335.0万人使用'
      },
      {
        id: '2',
        type: 'image',
        title: '仓鼠特写',
        coverUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c',
        creator: {
          name: '@仓鼠控',
          avatar: '仓'
        },
        usage: '58.3万人使用'
      }
    ]

    const videoItems: CreationItem[] = [
      {
        id: '1',
        type: 'video',
        title: '猴子玩耍',
        coverUrl: 'https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb',
        creator: {
          name: '@梦已逝',
          avatar: '梦'
        },
        usage: '40578人使用'
      },
      {
        id: '2',
        type: 'video',
        title: '老虎漫步',
        coverUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5',
        creator: {
          name: '@诺诺',
          avatar: '诺'
        },
        usage: '688人使用'
      }
    ]

    const writingItems: CreationItem[] = [
      {
        id: '1',
        type: 'writing',
        title: '商业计划书',
        desc: '专业的商业计划书模板，帮助你快速构建完整的商业逻辑和发展规划，吸引投资人的目光。',
        creator: {
          name: '@文字工作室',
          avatar: 'W'
        },
        usage: '56.3万人使用'
      },
      {
        id: '2',
        type: 'writing',
        title: '情感信件',
        desc: '表达你的真挚情感，无论是告白、道歉还是感谢，都能找到恰当的表达方式。',
        creator: {
          name: '@词语大师',
          avatar: 'C'
        },
        usage: '128.5万人使用'
      }
    ]

    const switchTab = (tab: typeof activeTab.value) => {
      activeTab.value = tab
    }

    const renderImageContent = () => (
      <div class="grid-container">
        {imageItems.map(item => (
          <div class="grid-item" key={item.id}>
            <div class="item-card">
              <div class="item-image">
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${item.coverUrl}) center/cover no-repeat`
                }}></div>
                <span class="image-title">{item.title}</span>
                <div class="overlay">做同款</div>
              </div>
              <div class="item-info">
                <div class="creator-avatar">{item.creator.avatar}</div>
                <span class="creator-name">{item.creator.name}</span>
                <div class="usage-count">{item.usage}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )

    const renderVideoContent = () => (
      <div class="grid-container">
        {videoItems.map(item => (
          <div class="grid-item" key={item.id}>
            <div class="item-card">
              <div class="item-image">
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${item.coverUrl}) center/cover no-repeat`
                }}></div>
                <span class="image-title">{item.title}</span>
                <div class="overlay">做同款</div>
              </div>
              <div class="item-info">
                <div class="creator-avatar">{item.creator.avatar}</div>
                <span class="creator-name">{item.creator.name}</span>
                <div class="usage-count">{item.usage}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )

    const renderWritingContent = () => (
      <div class="writing-list">
        {writingItems.map(item => (
          <div class="writing-item" key={item.id}>
            <div class="writing-title">{item.title}</div>
            <div class="writing-desc">{item.desc}</div>
            <div class="item-info">
              <div class="creator-avatar">{item.creator.avatar}</div>
              <span class="creator-name">{item.creator.name}</span>
              <div class="usage-count">{item.usage}</div>
            </div>
          </div>
        ))}
      </div>
    )

    return () => (
      <div class="page-container">
        <StatusBar />
        
        <div class="page-header">
          <div class="page-title">创作</div>
        </div>

        <div class="menu-tabs">
          <div 
            class={`menu-tab ${activeTab.value === 'image' ? 'active' : ''}`}
            onClick={() => switchTab('image')}
          >
            AI画图
          </div>
          <div 
            class={`menu-tab ${activeTab.value === 'video' ? 'active' : ''}`}
            onClick={() => switchTab('video')}
          >
            AI视频
          </div>
          <div 
            class={`menu-tab ${activeTab.value === 'writing' ? 'active' : ''}`}
            onClick={() => switchTab('writing')}
          >
            AI写作
          </div>
        </div>

        <div class="tab-content">
          <div class={`content-section ${activeTab.value === 'image' ? 'active' : ''}`}>
            {renderImageContent()}
          </div>
          <div class={`content-section ${activeTab.value === 'video' ? 'active' : ''}`}>
            {renderVideoContent()}
          </div>
          <div class={`content-section ${activeTab.value === 'writing' ? 'active' : ''}`}>
            {renderWritingContent()}
          </div>
        </div>

        <button class="create-button">
          <i class="fas fa-star"></i>
          开始创作
        </button>

        <BottomNav />
      </div>
    )
  }
}) 