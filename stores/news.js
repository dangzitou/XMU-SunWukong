import { defineStore } from 'pinia';

export const useNewsStore = defineStore('news', {
  state: () => ({
    newsList: [],
    newsDetail: {},
    isLoading: false,
    currentCategory: 'all', // all, announcement, activity, system
    searchKeyword: '',
    readNews: [], // 已读新闻ID列表
    currentPage: 1,
    pageSize: 10,
    hasMore: true
  }),

  getters: {
    // 根据分类和搜索关键词过滤新闻
    filteredNews: (state) => {
      let news = state.newsList;

      // 分类筛选
      if (state.currentCategory !== 'all') {
        news = news.filter(item => item.category === state.currentCategory);
      }

      // 关键词搜索
      if (state.searchKeyword) {
        news = news.filter(item =>
          item.title?.includes(state.searchKeyword) ||
          item.content?.includes(state.searchKeyword)
        );
      }

      return news.sort((a, b) => new Date(b.created_time) - new Date(a.created_time));
    },

    // 获取未读新闻数量
    unreadNewsCount: (state) => {
      return state.newsList.filter(news => !state.readNews.includes(news.id)).length;
    },

    // 获取热门新闻（根据阅读量）
    hotNews: (state) => {
      return state.newsList
        .filter(news => news.view_count > 0)
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 5);
    },

    // 获取最新新闻
    latestNews: (state) => {
      return state.newsList
        .sort((a, b) => new Date(b.created_time) - new Date(a.created_time))
        .slice(0, 5);
    },

    // 检查新闻是否已读
    isNewsRead: (state) => (newsId) => {
      return state.readNews.includes(newsId);
    },

    // 获取分页信息
    paginationInfo: (state) => ({
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      hasMore: state.hasMore,
      total: state.newsList.length
    })
  },

  actions: {
    setNewsList(list) {
      this.newsList = list;
    },

    addNews(news) {
      this.newsList.unshift(news);
    },

    updateNews(newsId, updates) {
      const index = this.newsList.findIndex(news => news.id === newsId);
      if (index >= 0) {
        this.newsList[index] = { ...this.newsList[index], ...updates };
      }
    },

    setNewsDetail(detail) {
      this.newsDetail = detail;
      // 标记为已读
      if (detail.id && !this.readNews.includes(detail.id)) {
        this.readNews.push(detail.id);
      }
    },

    setIsLoading(val) {
      this.isLoading = val;
    },

    setCurrentCategory(category) {
      this.currentCategory = category;
    },

    setSearchKeyword(keyword) {
      this.searchKeyword = keyword;
    },

    setCurrentPage(page) {
      this.currentPage = page;
    },

    setPageSize(size) {
      this.pageSize = size;
    },

    setHasMore(val) {
      this.hasMore = val;
    },

    // 标记新闻为已读
    markAsRead(newsId) {
      if (!this.readNews.includes(newsId)) {
        this.readNews.push(newsId);
      }
    },

    // 标记所有新闻为已读
    markAllAsRead() {
      this.readNews = this.newsList.map(news => news.id);
    },

    // 增加新闻阅读量
    incrementViewCount(newsId) {
      const news = this.newsList.find(item => item.id === newsId);
      if (news) {
        news.view_count = (news.view_count || 0) + 1;
      }
      if (this.newsDetail.id === newsId) {
        this.newsDetail.view_count = (this.newsDetail.view_count || 0) + 1;
      }
    },

    // 重置分页
    resetPagination() {
      this.currentPage = 1;
      this.hasMore = true;
    },

    reset() {
      this.newsList = [];
      this.newsDetail = {};
      this.isLoading = false;
      this.currentCategory = 'all';
      this.searchKeyword = '';
      this.currentPage = 1;
      this.pageSize = 10;
      this.hasMore = true;
    }
  },

  // 持久化配置
  persist: {
    key: 'news-store',
    paths: ['readNews', 'currentCategory']
  }
});