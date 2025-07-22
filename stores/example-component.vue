<template>
  <view class="example-container">
    <!-- 应用状态示例 -->
    <view class="section">
      <view class="section-title">应用状态示例</view>
      <view class="user-card">
        <image :src="appStore.userAvatar" class="avatar" />
        <view class="user-info">
          <text class="username">{{ appStore.userName }}</text>
          <text class="login-status">{{ appStore.isAuthenticated ? '已登录' : '未登录' }}</text>
        </view>
        <button @click="toggleLogin" class="login-btn">
          {{ appStore.isAuthenticated ? '登出' : '登录' }}
        </button>
      </view>
    </view>

    <!-- 项目状态示例 -->
    <view class="section">
      <view class="section-title">项目管理示例</view>
      
      <!-- 搜索和筛选 -->
      <view class="filter-bar">
        <input 
          v-model="searchKeyword" 
          placeholder="搜索项目..." 
          class="search-input"
          @input="onSearch"
        />
        <picker 
          :value="filterIndex" 
          :range="filterOptions" 
          @change="onFilterChange"
          class="filter-picker"
        >
          <view class="picker-text">{{ filterOptions[filterIndex] }}</view>
        </picker>
      </view>

      <!-- 项目统计 -->
      <view class="stats-bar">
        <view class="stat-item">
          <text class="stat-number">{{ projectStore.projectCount }}</text>
          <text class="stat-label">总项目</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ projectStore.filteredProjects.length }}</text>
          <text class="stat-label">筛选结果</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ favoriteCount }}</text>
          <text class="stat-label">收藏项目</text>
        </view>
      </view>

      <!-- 项目列表 -->
      <scroll-view 
        scroll-y 
        class="project-list"
        @scrolltolower="loadMore"
        refresher-enabled
        @refresherrefresh="refresh"
        :refresher-triggered="isRefreshing"
      >
        <view 
          v-for="project in projectStore.filteredProjects" 
          :key="project.id"
          class="project-item"
          @click="viewProject(project)"
        >
          <image :src="projectStore.getProjectImage(project.id)" class="project-image" />
          <view class="project-content">
            <view class="project-header">
              <text class="project-name">{{ project.project_name }}</text>
              <view 
                class="favorite-btn"
                :class="{ active: projectStore.isProjectFavorite(project.id) }"
                @click.stop="toggleFavorite(project.id)"
              >
                ❤️
              </view>
            </view>
            <text class="project-desc">{{ project.project_description }}</text>
            <view class="project-footer">
              <image :src="projectStore.getCreatorAvatar(project.creator_id)" class="creator-avatar" />
              <text class="creator-name">{{ project.creator_name }}</text>
              <text class="create-time">{{ formatTime(project.created_time) }}</text>
            </view>
          </view>
        </view>
        
        <!-- 加载状态 -->
        <view v-if="projectStore.isLoading" class="loading">
          <text>加载中...</text>
        </view>
        
        <!-- 空状态 -->
        <view v-if="!projectStore.isLoading && projectStore.filteredProjects.length === 0" class="empty">
          <text>暂无项目数据</text>
        </view>
      </scroll-view>
    </view>

    <!-- 消息状态示例 -->
    <view class="section">
      <view class="section-title">
        消息中心示例
        <view v-if="messageStore.totalUnreadCount > 0" class="badge">
          {{ messageStore.totalUnreadCount }}
        </view>
      </view>
      
      <view class="message-tabs">
        <view 
          v-for="(tab, index) in messageTabs" 
          :key="tab.key"
          class="tab-item"
          :class="{ active: messageStore.messageFilter === tab.key }"
          @click="switchMessageTab(tab.key)"
        >
          <text class="tab-text">{{ tab.label }}</text>
          <view v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</view>
        </view>
      </view>

      <view class="message-list">
        <view 
          v-for="message in messageStore.filteredMessages.slice(0, 3)" 
          :key="message.id"
          class="message-item"
          :class="{ unread: !message.is_read }"
          @click="readMessage(message)"
        >
          <view class="message-content">
            <text class="message-title">{{ message.title }}</text>
            <text class="message-preview">{{ message.content }}</text>
          </view>
          <text class="message-time">{{ formatTime(message.created_time) }}</text>
        </view>
      </view>

      <button @click="markAllRead" class="mark-all-btn">标记全部已读</button>
    </view>

    <!-- 全局错误提示 -->
    <view v-if="appStore.globalError" class="error-toast" @click="appStore.clearGlobalError()">
      <text class="error-text">{{ appStore.globalError }}</text>
      <text class="close-btn">×</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useProjectStore } from '@/stores/project'
import { useMessageStore } from '@/stores/message'

// 使用 stores
const appStore = useAppStore()
const projectStore = useProjectStore()
const messageStore = useMessageStore()

// 响应式数据
const searchKeyword = ref('')
const filterIndex = ref(0)
const isRefreshing = ref(false)

// 筛选选项
const filterOptions = ['全部项目', '我的项目', '参与项目', '收藏项目']
const filterKeys = ['', 'my_projects', 'joined_projects', 'favorite_projects']

// 消息标签页
const messageTabs = computed(() => [
  { key: 'all', label: '全部', count: messageStore.totalUnreadCount },
  { key: 'system', label: '系统', count: messageStore.unreadSystemCount },
  { key: 'invite', label: '邀请', count: messageStore.unreadInviteCount },
  { key: 'request', label: '请求', count: messageStore.unreadRequestCount }
])

// 计算属性
const favoriteCount = computed(() => {
  return projectStore.favoriteProjects.length
})

// 方法
const toggleLogin = () => {
  if (appStore.isAuthenticated) {
    appStore.logout()
    uni.showToast({ title: '已登出', icon: 'success' })
  } else {
    // 模拟登录
    const mockUser = {
      id: 1,
      username: 'testuser',
      nickname: '测试用户',
      avatar: '/static/default_avatar.png'
    }
    appStore.login(mockUser, 'mock-token')
    uni.showToast({ title: '登录成功', icon: 'success' })
  }
}

const onSearch = () => {
  projectStore.setSearchKeyword(searchKeyword.value)
}

const onFilterChange = (e) => {
  filterIndex.value = e.detail.value
  projectStore.setCurrentFilter(filterKeys[filterIndex.value])
}

const viewProject = (project) => {
  projectStore.setShowProjectDetail(project)
  uni.navigateTo({
    url: `/pages/project/detail?id=${project.id}`
  })
}

const toggleFavorite = (projectId) => {
  projectStore.toggleFavoriteProject(projectId)
  const isFavorite = projectStore.isProjectFavorite(projectId)
  uni.showToast({
    title: isFavorite ? '已收藏' : '已取消收藏',
    icon: 'success'
  })
}

const loadMore = () => {
  if (projectStore.hasMore && !projectStore.isLoading) {
    // 模拟加载更多数据
    console.log('加载更多项目...')
  }
}

const refresh = async () => {
  isRefreshing.value = true
  try {
    // 模拟刷新数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    uni.showToast({ title: '刷新成功', icon: 'success' })
  } finally {
    isRefreshing.value = false
  }
}

const switchMessageTab = (key) => {
  messageStore.setMessageFilter(key)
}

const readMessage = (message) => {
  messageStore.markAsRead(message.id)
  uni.navigateTo({
    url: `/pages/message/detail?id=${message.id}`
  })
}

const markAllRead = () => {
  messageStore.markAllAsRead()
  uni.showToast({ title: '已标记全部已读', icon: 'success' })
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return Math.floor(diff / 86400000) + '天前'
}

// 生命周期
onMounted(async () => {
  // 初始化应用
  await appStore.initApp()
  
  // 模拟加载数据
  const mockProjects = [
    {
      id: 1,
      project_name: '示例项目1',
      project_description: '这是一个示例项目的描述',
      creator_id: 1,
      creator_name: '创建者1',
      created_time: new Date().toISOString()
    },
    {
      id: 2,
      project_name: '示例项目2',
      project_description: '这是另一个示例项目的描述',
      creator_id: 2,
      creator_name: '创建者2',
      created_time: new Date(Date.now() - 86400000).toISOString()
    }
  ]
  
  const mockMessages = [
    {
      id: 1,
      title: '系统通知',
      content: '欢迎使用本系统',
      is_read: false,
      created_time: new Date().toISOString()
    },
    {
      id: 2,
      title: '项目邀请',
      content: '您收到了一个项目邀请',
      is_read: false,
      created_time: new Date(Date.now() - 3600000).toISOString()
    }
  ]
  
  projectStore.setList(mockProjects)
  messageStore.setMessageList(mockMessages)
  messageStore.setSystemMessages([mockMessages[0]])
  messageStore.setInviteMessages([mockMessages[1]])
})
</script>

<style scoped>
.example-container {
  padding: 20rpx;
}

.section {
  margin-bottom: 40rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  position: relative;
}

.badge {
  position: absolute;
  top: -10rpx;
  right: -20rpx;
  background: #ff4757;
  color: white;
  border-radius: 20rpx;
  padding: 4rpx 12rpx;
  font-size: 20rpx;
  min-width: 32rpx;
  text-align: center;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 20rpx;
}

.user-info {
  flex: 1;
}

.username {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.login-status {
  font-size: 24rpx;
  color: #666;
}

.login-btn {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 16rpx 24rpx;
  font-size: 24rpx;
}

.filter-bar {
  display: flex;
  margin-bottom: 20rpx;
  gap: 20rpx;
}

.search-input {
  flex: 1;
  padding: 16rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.filter-picker {
  padding: 16rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 8rpx;
  min-width: 160rpx;
}

.picker-text {
  font-size: 28rpx;
  text-align: center;
}

.stats-bar {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #007bff;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.project-list {
  height: 600rpx;
}

.project-item {
  display: flex;
  padding: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.project-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}

.project-content {
  flex: 1;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.project-name {
  font-size: 30rpx;
  font-weight: bold;
}

.favorite-btn {
  font-size: 32rpx;
  opacity: 0.5;
}

.favorite-btn.active {
  opacity: 1;
}

.project-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-footer {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.creator-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 20rpx;
}

.creator-name {
  font-size: 24rpx;
  color: #666;
}

.create-time {
  font-size: 24rpx;
  color: #999;
  margin-left: auto;
}

.loading, .empty {
  text-align: center;
  padding: 40rpx;
  color: #666;
}

.message-tabs {
  display: flex;
  margin-bottom: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  position: relative;
}

.tab-item.active {
  color: #007bff;
  border-bottom: 4rpx solid #007bff;
}

.tab-text {
  font-size: 28rpx;
}

.tab-badge {
  position: absolute;
  top: 8rpx;
  right: 20rpx;
  background: #ff4757;
  color: white;
  border-radius: 16rpx;
  padding: 2rpx 8rpx;
  font-size: 20rpx;
  min-width: 24rpx;
  text-align: center;
}

.message-list {
  margin-bottom: 20rpx;
}

.message-item {
  display: flex;
  padding: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.message-item.unread {
  background: #f8f9ff;
}

.message-content {
  flex: 1;
}

.message-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.message-preview {
  font-size: 24rpx;
  color: #666;
}

.message-time {
  font-size: 24rpx;
  color: #999;
  align-self: flex-start;
}

.mark-all-btn {
  width: 100%;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.error-toast {
  position: fixed;
  top: 100rpx;
  left: 40rpx;
  right: 40rpx;
  background: #ff4757;
  color: white;
  padding: 20rpx;
  border-radius: 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
}

.error-text {
  flex: 1;
  font-size: 28rpx;
}

.close-btn {
  font-size: 36rpx;
  font-weight: bold;
  margin-left: 20rpx;
}
</style>
