import { defineStore } from 'pinia';

export const useHomeStore = defineStore('home', {
  state: () => ({
    homeData: {},
    isLoading: false,
    banners: [],
    announcements: [],
    statistics: {},
    refreshTime: null
  }),

  getters: {
    // 获取轮播图数据
    activeBanners: (state) => {
      return state.banners.filter(banner => banner.is_active);
    },

    // 获取最新公告
    latestAnnouncements: (state) => {
      return state.announcements
        .filter(ann => ann.is_published)
        .sort((a, b) => new Date(b.created_time) - new Date(a.created_time))
        .slice(0, 5);
    },

    // 获取统计数据
    homeStatistics: (state) => ({
      totalProjects: state.statistics.total_projects || 0,
      totalUsers: state.statistics.total_users || 0,
      activeProjects: state.statistics.active_projects || 0,
      todayRegistrations: state.statistics.today_registrations || 0
    }),

    // 检查数据是否需要刷新
    needsRefresh: (state) => {
      if (!state.refreshTime) return true;
      const now = Date.now();
      const lastRefresh = new Date(state.refreshTime).getTime();
      return (now - lastRefresh) > 5 * 60 * 1000; // 5分钟
    }
  },

  actions: {
    setHomeData(data) {
      this.homeData = data;
      this.refreshTime = new Date().toISOString();
    },

    setBanners(banners) {
      this.banners = banners;
    },

    setAnnouncements(announcements) {
      this.announcements = announcements;
    },

    setStatistics(statistics) {
      this.statistics = statistics;
    },

    setIsLoading(val) {
      this.isLoading = val;
    },

    updateRefreshTime() {
      this.refreshTime = new Date().toISOString();
    },

    reset() {
      this.homeData = {};
      this.isLoading = false;
      this.banners = [];
      this.announcements = [];
      this.statistics = {};
      this.refreshTime = null;
    }
  },

  // 持久化配置
  persist: {
    key: 'home-store',
    paths: ['homeData', 'banners', 'announcements', 'statistics', 'refreshTime']
  }
});