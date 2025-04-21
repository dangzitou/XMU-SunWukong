<template>
  <view class="custom-tab-bar">
    <view
      v-for="(item, index) in tabList"
      :key="index"
      class="tab-item"
      :class="{ active: current === index }"
      @tap="switchTab(item.pagePath, index)"
    >
      <image :src="current === index ? item.selectedIconPath : item.iconPath" class="tab-icon" :class="{ 'active-icon': current === index }" />
      <text class="tab-text" :class="{ 'active-text': current === index }">{{ item.text }}</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      current: 0,
      tabList: [
        {
          pagePath: '/pages/home',
          iconPath: '/static/tabBar/home.png',
          selectedIconPath: '/static/tabBar/home(selected).png',
          text: '首页'
        },
        {
          pagePath: '/pages/project/main_page',
          iconPath: '/static/tabBar/project.png',
          selectedIconPath: '/static/tabBar/project(selected).png',
          text: '项目'
        },
        {
          pagePath: '/pages/message/main_page',
          iconPath: '/static/tabBar/message.png',
          selectedIconPath: '/static/tabBar/message(selected).png',
          text: '消息'
        },
        {
          pagePath: '/pages/profile/main_page',
          iconPath: '/static/tabBar/personal.png',
          selectedIconPath: '/static/tabBar/personal(selected).png',
          text: '我'
        }
      ]
    };
  },
  methods: {
    switchTab(url, index) {
      this.current = index;
      uni.switchTab({
        url
      });
    }
  },
  onShow() {
    const pages = getCurrentPages();
    const page = pages[pages.length - 1];
    const route = '/' + page.route;
    
    // 设置当前选中的tab
    const currentTab = this.tabList.findIndex(item => item.pagePath === route);
    if (currentTab !== -1) {
      this.current = currentTab;
    }
  }
};
</script>

<style>
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140rpx;
  display: flex;
  background-color: #ffffff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 999;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10rpx 0;
}

.tab-icon {
  width: 60rpx;
  height: 60rpx;
  margin-bottom: 8rpx;
  transition: all 0.3s;
}

.tab-text {
  font-size: 24rpx;
  color: #7A7E83;
  transition: all 0.3s;
}

.active-icon {
  width: 72rpx; /* 选中时图标变大 */
  height: 72rpx;
  transform: translateY(-6rpx); /* 稍微上移 */
}

.active-text {
  font-size: 28rpx; /* 选中时文字变大 */
  color: #07c160;
  font-weight: bold;
}
</style> 