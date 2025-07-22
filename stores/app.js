import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    // 用户认证状态
    isLoggedIn: false,
    userInfo: null,
    token: null,
    
    // 应用配置
    appConfig: {
      theme: 'light', // light, dark
      language: 'zh-CN',
      version: '1.0.0'
    },
    
    // 网络状态
    networkStatus: {
      isOnline: true,
      networkType: 'wifi'
    },
    
    // 系统信息
    systemInfo: {
      platform: '',
      system: '',
      version: '',
      screenWidth: 0,
      screenHeight: 0,
      statusBarHeight: 0,
      safeAreaInsets: {}
    },
    
    // 全局加载状态
    globalLoading: false,
    
    // 全局错误信息
    globalError: null,
    
    // 页面栈信息
    pageStack: [],
    currentPage: '',
    
    // 权限状态
    permissions: {
      camera: false,
      location: false,
      microphone: false,
      album: false
    }
  }),
  
  getters: {
    // 是否已登录
    isAuthenticated: (state) => state.isLoggedIn && !!state.token,
    
    // 用户头像
    userAvatar: (state) => state.userInfo?.avatar || '/static/default_avatar.png',
    
    // 用户昵称
    userName: (state) => state.userInfo?.nickname || state.userInfo?.username || '未登录',
    
    // 是否为暗色主题
    isDarkTheme: (state) => state.appConfig.theme === 'dark',
    
    // 是否为移动端
    isMobile: (state) => state.systemInfo.platform === 'android' || state.systemInfo.platform === 'ios',
    
    // 安全区域高度
    safeAreaTop: (state) => state.systemInfo.safeAreaInsets?.top || state.systemInfo.statusBarHeight || 0,
    
    // 屏幕尺寸信息
    screenInfo: (state) => ({
      width: state.systemInfo.screenWidth,
      height: state.systemInfo.screenHeight,
      ratio: state.systemInfo.screenWidth / state.systemInfo.screenHeight
    })
  },
  
  actions: {
    // 设置登录状态
    setLoginStatus(isLoggedIn, userInfo = null, token = null) {
      this.isLoggedIn = isLoggedIn;
      this.userInfo = userInfo;
      this.token = token;
    },
    
    // 登录
    login(userInfo, token) {
      this.setLoginStatus(true, userInfo, token);
    },
    
    // 登出
    logout() {
      this.setLoginStatus(false, null, null);
      // 清除其他store的用户相关数据
      this.clearUserData();
    },
    
    // 更新用户信息
    updateUserInfo(userInfo) {
      this.userInfo = { ...this.userInfo, ...userInfo };
    },
    
    // 设置应用配置
    setAppConfig(config) {
      this.appConfig = { ...this.appConfig, ...config };
    },
    
    // 切换主题
    toggleTheme() {
      this.appConfig.theme = this.appConfig.theme === 'light' ? 'dark' : 'light';
    },
    
    // 设置语言
    setLanguage(language) {
      this.appConfig.language = language;
    },
    
    // 更新网络状态
    updateNetworkStatus(status) {
      this.networkStatus = { ...this.networkStatus, ...status };
    },
    
    // 设置系统信息
    setSystemInfo(systemInfo) {
      this.systemInfo = { ...this.systemInfo, ...systemInfo };
    },
    
    // 设置全局加载状态
    setGlobalLoading(loading) {
      this.globalLoading = loading;
    },
    
    // 设置全局错误
    setGlobalError(error) {
      this.globalError = error;
    },
    
    // 清除全局错误
    clearGlobalError() {
      this.globalError = null;
    },
    
    // 更新页面栈
    updatePageStack(pages) {
      this.pageStack = pages;
    },
    
    // 设置当前页面
    setCurrentPage(page) {
      this.currentPage = page;
    },
    
    // 更新权限状态
    updatePermissions(permissions) {
      this.permissions = { ...this.permissions, ...permissions };
    },
    
    // 请求权限
    async requestPermission(type) {
      try {
        // 这里可以添加具体的权限请求逻辑
        // 根据不同平台调用不同的权限请求API
        this.permissions[type] = true;
        return true;
      } catch (error) {
        console.error(`Request ${type} permission failed:`, error);
        this.permissions[type] = false;
        return false;
      }
    },
    
    // 初始化应用
    async initApp() {
      try {
        // 获取系统信息
        const systemInfo = uni.getSystemInfoSync();
        this.setSystemInfo(systemInfo);
        
        // 监听网络状态
        uni.onNetworkStatusChange((res) => {
          this.updateNetworkStatus({
            isOnline: res.isConnected,
            networkType: res.networkType
          });
        });
        
        // 获取当前页面栈
        const pages = getCurrentPages();
        this.updatePageStack(pages.map(page => page.route));
        
        return true;
      } catch (error) {
        console.error('App initialization failed:', error);
        this.setGlobalError('应用初始化失败');
        return false;
      }
    },
    
    // 清除用户数据
    clearUserData() {
      // 这里可以调用其他store的reset方法
      // 例如：useProjectStore().reset();
    },
    
    // 重置应用状态
    reset() {
      this.isLoggedIn = false;
      this.userInfo = null;
      this.token = null;
      this.globalLoading = false;
      this.globalError = null;
      this.currentPage = '';
      this.pageStack = [];
    }
  },
  
  // 持久化配置
  persist: {
    key: 'app-store',
    storage: {
      getItem: (key) => uni.getStorageSync(key),
      setItem: (key, value) => uni.setStorageSync(key, value),
      removeItem: (key) => uni.removeStorageSync(key)
    },
    // 只持久化部分状态
    paths: ['isLoggedIn', 'userInfo', 'token', 'appConfig', 'permissions']
  }
});
