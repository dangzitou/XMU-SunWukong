# Pinia 状态管理使用指南

本项目使用 Pinia 作为状态管理库，提供了完整的状态管理解决方案。

## 📁 Store 结构

```
stores/
├── index.js          # Pinia 入口文件，配置持久化插件
├── app.js           # 全局应用状态管理
├── user.js          # 用户相关状态管理
├── project.js       # 项目相关状态管理
├── message.js       # 消息相关状态管理
├── profile.js       # 个人资料状态管理
├── home.js          # 首页状态管理
├── competition.js   # 竞赛状态管理
├── inProject.js     # 项目内状态管理
├── news.js          # 新闻状态管理
└── README.md        # 使用指南（本文件）
```

## 🚀 基本使用

### 1. 在组件中导入和使用 Store

```vue
<template>
  <view class="container">
    <!-- 显示用户信息 -->
    <view class="user-info">
      <image :src="appStore.userAvatar" class="avatar" />
      <text class="username">{{ appStore.userName }}</text>
    </view>
    
    <!-- 显示项目列表 -->
    <view class="project-list">
      <view 
        v-for="project in projectStore.filteredProjects" 
        :key="project.id"
        class="project-item"
        @click="viewProject(project)"
      >
        <text class="project-name">{{ project.project_name }}</text>
        <text class="project-desc">{{ project.project_description }}</text>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="projectStore.isLoading" class="loading">
      加载中...
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useProjectStore } from '@/stores/project'
import { useUserStore } from '@/stores/user'

// 使用 store
const appStore = useAppStore()
const projectStore = useProjectStore()
const userStore = useUserStore()

// 响应式数据
const searchKeyword = ref('')

// 计算属性
const filteredProjects = computed(() => {
  return projectStore.filteredProjects
})

// 方法
const loadProjects = async () => {
  try {
    projectStore.setIsLoading(true)
    // 调用 API 获取项目数据
    const response = await uni.request({
      url: '/api/projects',
      method: 'GET'
    })
    projectStore.setList(response.data)
  } catch (error) {
    console.error('加载项目失败:', error)
    appStore.setGlobalError('加载项目失败')
  } finally {
    projectStore.setIsLoading(false)
  }
}

const viewProject = (project) => {
  projectStore.setShowProjectDetail(project)
  uni.navigateTo({
    url: '/pages/project/detail?id=' + project.id
  })
}

const searchProjects = () => {
  projectStore.setSearchKeyword(searchKeyword.value)
}

// 生命周期
onMounted(() => {
  // 初始化应用
  appStore.initApp()
  // 加载项目数据
  loadProjects()
})
</script>
```

### 2. 使用 Getters

```javascript
// 在组件中使用 getters
const projectCount = computed(() => projectStore.projectCount)
const unreadCount = computed(() => messageStore.totalUnreadCount)
const isAuthenticated = computed(() => appStore.isAuthenticated)

// 使用带参数的 getters
const isProjectFavorite = (projectId) => {
  return projectStore.isProjectFavorite(projectId)
}
```

### 3. 调用 Actions

```javascript
// 基本 actions
projectStore.setIsLoading(true)
userStore.setUserList(users)
messageStore.markAsRead(messageId)

// 复杂 actions
await appStore.login(userInfo, token)
projectStore.toggleFavoriteProject(projectId)
messageStore.handleInviteMessage(messageId, 'accepted')
```

## 🔄 状态持久化

项目配置了状态持久化，以下状态会自动保存到本地存储：

- **app**: 登录状态、用户信息、应用配置、权限状态
- **user**: 选中项目、邀请用户、用户项目
- **project**: 收藏项目、项目图片、创建者头像
- **message**: 最后阅读时间、消息筛选
- **profile**: 用户资料
- **home**: 首页数据、轮播图、公告、统计数据
- **competition**: 我的竞赛
- **inProject**: 当前标签页
- **news**: 已读新闻、当前分类

## 📱 在页面中使用

### 页面级别的状态管理

```vue
<!-- pages/project/main_page.vue -->
<script setup>
import { useProjectStore } from '@/stores/project'
import { useAppStore } from '@/stores/app'

const projectStore = useProjectStore()
const appStore = useAppStore()

// 页面加载时初始化数据
onLoad(() => {
  if (!projectStore.isInitialized) {
    loadInitialData()
  }
})

// 页面显示时刷新数据
onShow(() => {
  if (projectStore.needsRefresh) {
    refreshData()
  }
})

// 下拉刷新
const onPullDownRefresh = async () => {
  await refreshData()
  uni.stopPullDownRefresh()
}

// 上拉加载更多
const onReachBottom = () => {
  if (projectStore.hasMore && !projectStore.isLoading) {
    loadMoreProjects()
  }
}
</script>
```

## 🛠 最佳实践

### 1. Store 命名规范
- 使用 `use` + `StoreName` + `Store` 的命名方式
- 例如：`useUserStore`、`useProjectStore`

### 2. 状态更新
```javascript
// ✅ 推荐：使用 actions 更新状态
projectStore.updateProject(projectId, { name: 'New Name' })

// ❌ 不推荐：直接修改状态
projectStore.list[0].name = 'New Name'
```

### 3. 异步操作
```javascript
// ✅ 推荐：在 actions 中处理异步操作
const loadData = async () => {
  try {
    store.setIsLoading(true)
    const data = await api.getData()
    store.setData(data)
  } catch (error) {
    store.setError(error.message)
  } finally {
    store.setIsLoading(false)
  }
}
```

### 4. 错误处理
```javascript
// 使用全局错误状态
appStore.setGlobalError('操作失败，请重试')

// 清除错误
appStore.clearGlobalError()
```

### 5. 重置状态
```javascript
// 用户登出时重置所有相关状态
const logout = () => {
  appStore.logout()
  userStore.reset()
  projectStore.reset()
  messageStore.reset()
}
```

## 🔧 调试技巧

### 1. 使用 Vue DevTools
安装 Vue DevTools 浏览器扩展，可以实时查看和修改 store 状态。

### 2. 控制台调试
```javascript
// 在控制台中访问 store
const { useProjectStore } = require('@/stores/project')
const projectStore = useProjectStore()
console.log(projectStore.list)
```

### 3. 状态日志
```javascript
// 在 actions 中添加日志
setList(list) {
  console.log('Setting project list:', list)
  this.list = list
}
```

## 📚 相关文档

- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [UniApp 状态管理](https://uniapp.dcloud.net.cn/tutorial/vue3-composition-api.html)
