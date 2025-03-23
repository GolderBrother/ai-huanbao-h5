import { defineComponent, ref } from 'vue'
import StatusBar from '@/components/StatusBar'
import BottomNav from '@/components/BottomNav'
import './index.scss'

interface SearchResult {
  id: string
  type: 'news' | 'video'
  source: string
  time: string
  title: string
  desc: string
  imageUrl: string
  stats: {
    likes: number
    comments: number
  }
}

export default defineComponent({
  name: 'Search',
  setup() {
    const activeTab = ref('综合')
    const searchTabs = ['综合', '资讯', '视频', '图片', '公众号', '小程序', '知识']
    
    const hotSearches = [
      { id: '1', rank: 1, title: '人工智能新突破' },
      { id: '2', rank: 2, title: '全球气候变化会议' },
      { id: '3', rank: 3, title: '新能源汽车销量' },
      { id: '4', rank: 4, title: '数字人民币试点' },
      { id: '5', rank: 5, title: '元宇宙发展前景' },
      { id: '6', rank: 6, title: '健康生活方式' }
    ]

    const searchResults: SearchResult[] = [
      {
        id: '1',
        type: 'news',
        source: '科技日报',
        time: '2小时前',
        title: '人工智能新突破：大模型在医疗领域的应用',
        desc: '近日，多家科技公司发布了针对医疗领域的大模型应用，这些模型在医学影像识别、疾病诊断等方面表现出色，有望大幅提升医疗效率和准确性...',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        stats: {
          likes: 3200,
          comments: 568
        }
      },
      {
        id: '2',
        type: 'video',
        source: '科技视频',
        time: '5小时前',
        title: '大模型技术解析：从GPT到最新技术发展',
        desc: '本视频详细解析了从GPT到最新大模型技术的发展历程，包括技术原理、应用场景以及未来发展趋势...',
        imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485',
        stats: {
          likes: 5700,
          comments: 1200
        }
      }
    ]

    return () => (
      <div class="page-container">
        <StatusBar />
        
        <div class="search-header">
          <div class="search-input-container">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              class="search-input" 
              placeholder="搜索或输入网址"
            />
            <i class="fas fa-microphone voice-icon"></i>
          </div>
        </div>

        <div class="search-tabs">
          {searchTabs.map(tab => (
            <div 
              key={tab}
              class={`search-tab ${activeTab.value === tab ? 'active' : ''}`}
              onClick={() => activeTab.value = tab}
            >
              {tab}
            </div>
          ))}
        </div>

        <div class="search-content">
          {/* 热搜榜 */}
          <div class="hot-searches">
            <div class="hot-search-title">热搜榜</div>
            <div class="hot-search-list">
              {hotSearches.map(item => (
                <div class="hot-search-item" key={item.id}>
                  <span class="hot-search-rank">{item.rank}</span>
                  {item.title}
                </div>
              ))}
            </div>
          </div>

          {/* 搜索结果 */}
          <div class="search-results">
            {searchResults.map(result => (
              <div class="search-result" key={result.id}>
                <div class="result-header">
                  <div class="result-source-icon">
                    <i class={`fas ${result.type === 'news' ? 'fa-newspaper' : 'fa-video'}`}></i>
                  </div>
                  <div class="result-source">{result.source}</div>
                  <div class="result-time">{result.time}</div>
                </div>
                <div class="result-content">
                  <div class="result-title">{result.title}</div>
                  <div class="result-desc">{result.desc}</div>
                  <img src={result.imageUrl} alt={result.title} class="result-image" />
                  <div class="result-actions">
                    <div class="result-action">
                      <i class="fas fa-thumbs-up"></i>
                      {result.stats.likes.toLocaleString()}
                    </div>
                    <div class="result-action">
                      <i class="fas fa-comment"></i>
                      {result.stats.comments.toLocaleString()}
                    </div>
                    <div class="result-action">
                      <i class="fas fa-share"></i>
                      分享
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <BottomNav />
      </div>
    )
  }
}) 