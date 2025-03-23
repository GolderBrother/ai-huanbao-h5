import { defineComponent } from 'vue'
import StatusBar from '@/components/StatusBar'
import BottomNav from '@/components/BottomNav'
import './index.scss'

interface MenuItem {
  id: string
  icon: string
  title: string
  iconColor: string
  badge?: number
}

export default defineComponent({
  name: 'Profile',
  setup() {
    const userInfo = {
      name: '张小明',
      id: '12345678',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
      isVip: true
    }

    const vipBenefits = [
      { icon: 'fa-bolt', text: '高速响应' },
      { icon: 'fa-infinity', text: '无限对话' },
      { icon: 'fa-brain', text: '高级模型' },
      { icon: 'fa-shield-alt', text: '隐私保护' }
    ]

    const functionMenus: MenuItem[] = [
      { id: '1', icon: 'fa-history', title: '历史记录', iconColor: '#1e88e5' },
      { id: '2', icon: 'fa-star', title: '收藏夹', iconColor: '#43a047' },
      { id: '3', icon: 'fa-bell', title: '消息通知', iconColor: '#fb8c00', badge: 2 }
    ]

    const settingMenus: MenuItem[] = [
      { id: '1', icon: 'fa-cog', title: '设置', iconColor: '#8e24aa' },
      { id: '2', icon: 'fa-headset', title: '帮助与反馈', iconColor: '#00acc1' },
      { id: '3', icon: 'fa-shield-alt', title: '隐私与安全', iconColor: '#e53935' },
      { id: '4', icon: 'fa-info-circle', title: '关于我们', iconColor: '#757575' }
    ]

    const handleLogout = () => {
      // 处理退出登录逻辑
      console.log('logout')
    }

    const renderMenuItem = (item: MenuItem) => (
      <div class="menu-item" key={item.id}>
        <div class="menu-icon" style={{ color: item.iconColor }}>
          <i class={`fas ${item.icon}`}></i>
        </div>
        <div class="menu-title">{item.title}</div>
        {item.badge && <div class="menu-badge">{item.badge}</div>}
        <div class="menu-arrow">
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    )

    return () => (
      <div class="page-container">
        <StatusBar />
        
        <div class="profile-header">
          <div class="profile-title">个人中心</div>
          <div class="profile-action">
            <i class="fas fa-qrcode"></i>
          </div>
        </div>

        {/* 用户信息 */}
        <div class="user-info">
          <div class="user-avatar">
            <img src={userInfo.avatar} alt="用户头像" />
          </div>
          <div class="user-details">
            <div class="user-name">{userInfo.name}</div>
            <div class="user-id">ID: {userInfo.id}</div>
            <div class="user-level">VIP会员</div>
          </div>
          <div class="user-edit">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>

        {/* VIP卡片 */}
        <div class="vip-card">
          <div class="vip-header">
            <div class="vip-title">
              <i class="fas fa-crown vip-icon"></i>
              <div class="vip-name">元宝VIP会员</div>
            </div>
            <div class="vip-btn">立即续费</div>
          </div>
          <div class="vip-benefits">
            {vipBenefits.map(benefit => (
              <div class="vip-benefit" key={benefit.text}>
                <div class="vip-benefit-icon">
                  <i class={`fas ${benefit.icon}`}></i>
                </div>
                <div>{benefit.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 功能菜单 */}
        <div class="menu-section">
          {functionMenus.map(item => renderMenuItem(item))}
        </div>

        {/* 设置菜单 */}
        <div class="menu-section">
          {settingMenus.map(item => renderMenuItem(item))}
        </div>

        {/* 退出登录 */}
        <div class="logout-btn" onClick={handleLogout}>
          退出登录
        </div>

        {/* 版本信息 */}
        <div class="app-version">
          元宝AI助手 v1.0.0
        </div>

        <BottomNav />
      </div>
    )
  }
}) 