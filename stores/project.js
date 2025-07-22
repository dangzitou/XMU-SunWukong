import { defineStore } from 'pinia';

export const useProjectStore = defineStore('project', {
  state: () => ({
    // 兼容原页面的状态结构
    globalData: {
      list: [],
      showProjectDetail: {}
    },
    search: '',
    currentFilter: '',
    modal: '',
    modal1: '',
    self_introduce: '',
    isLoading: false,
    hasMore: true,
    currentPage: 1,
    pageSize: 10,
    isInitialized: false,

    // 新增的状态
    allProjects: [],
    projectList: {},
    projectImages: {},
    creatorAvatars: {},
    tabsDatas: [],
    tabsIndex: 0,
    searchKeyword: '',
    sortBy: 'created_time', // created_time, updated_time, name
    sortOrder: 'desc', // asc, desc
    selectedCategories: [],
    favoriteProjects: []
  }),

  getters: {
    // 获取项目总数
    projectCount: (state) => state.globalData.list.length,

    // 获取所有项目总数
    allProjectCount: (state) => state.allProjects.length,

    // 兼容原页面的list访问
    list: (state) => state.globalData.list,

    // 兼容原页面的showProjectDetail访问
    showProjectDetail: (state) => state.globalData.showProjectDetail,

    // 根据筛选条件过滤项目
    filteredProjects: (state) => {
      let projects = state.globalData.list;

      // 关键词搜索
      if (state.search) {
        projects = projects.filter(project =>
          project.project_name?.includes(state.search) ||
          project.project_description?.includes(state.search) ||
          project.creator_name?.includes(state.search)
        );
      }

      // 分类筛选
      if (state.selectedCategories.length > 0) {
        projects = projects.filter(project =>
          state.selectedCategories.includes(project.category)
        );
      }

      // 当前筛选器
      if (state.currentFilter) {
        switch (state.currentFilter) {
          case '项目协作':
          case '竞赛组队':
          case '科研招募':
            projects = projects.filter(project => project.type === state.currentFilter);
            break;
          case 'my_projects':
            projects = projects.filter(project => project.is_creator);
            break;
          case 'joined_projects':
            projects = projects.filter(project => !project.is_creator && project.is_member);
            break;
          case 'favorite_projects':
            projects = projects.filter(project =>
              state.favoriteProjects.includes(project.id)
            );
            break;
        }
      }

      return projects;
    },

    // 获取当前选中的标签数据
    currentTabData: (state) => {
      return state.tabsDatas[state.tabsIndex] || {};
    },

    // 检查项目是否为收藏
    isProjectFavorite: (state) => (projectId) => {
      return state.favoriteProjects.includes(projectId);
    },

    // 获取项目详情
    getProjectDetail: (state) => (projectId) => {
      return state.allProjects.find(project => project.id === projectId) ||
             state.list.find(project => project.id === projectId);
    },

    // 获取项目图片
    getProjectImage: (state) => (projectId) => {
      return state.projectImages[projectId] || '/static/default.png';
    },

    // 获取创建者头像
    getCreatorAvatar: (state) => (creatorId) => {
      return state.creatorAvatars[creatorId] || '/static/default_avatar.png';
    },

    // 获取分页信息
    paginationInfo: (state) => ({
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      hasMore: state.hasMore,
      total: state.projectCount
    })
  },
  actions: {
    // 兼容原页面的方法
    setList(list) {
      this.globalData.list = list;
    },

    addProjects(projects) {
      this.globalData.list.push(...projects);
    },

    updateProject(projectId, updates) {
      const index = this.globalData.list.findIndex(p => p.id === projectId);
      if (index >= 0) {
        this.globalData.list[index] = { ...this.globalData.list[index], ...updates };
      }

      const allIndex = this.allProjects.findIndex(p => p.id === projectId);
      if (allIndex >= 0) {
        this.allProjects[allIndex] = { ...this.allProjects[allIndex], ...updates };
      }
    },

    removeProject(projectId) {
      this.globalData.list = this.globalData.list.filter(p => p.id !== projectId);
      this.allProjects = this.allProjects.filter(p => p.id !== projectId);
    },

    setAllProjects(all) {
      this.allProjects = all;
    },

    setProjectList(obj) {
      this.projectList = obj;
    },

    setShowProjectDetail(detail) {
      this.globalData.showProjectDetail = detail;
    },

    setPageSize(size) {
      this.pageSize = size;
    },

    setCurrentPage(page) {
      this.currentPage = page;
    },

    setIsLoading(val) {
      this.isLoading = val;
    },

    setHasMore(val) {
      this.hasMore = val;
    },

    setCurrentFilter(val) {
      this.currentFilter = val;
    },

    setSearchKeyword(keyword) {
      this.searchKeyword = keyword;
    },

    setSortBy(sortBy) {
      this.sortBy = sortBy;
    },

    setSortOrder(order) {
      this.sortOrder = order;
    },

    setSelectedCategories(categories) {
      this.selectedCategories = categories;
    },

    addFavoriteProject(projectId) {
      if (!this.favoriteProjects.includes(projectId)) {
        this.favoriteProjects.push(projectId);
      }
    },

    removeFavoriteProject(projectId) {
      this.favoriteProjects = this.favoriteProjects.filter(id => id !== projectId);
    },

    toggleFavoriteProject(projectId) {
      if (this.isProjectFavorite(projectId)) {
        this.removeFavoriteProject(projectId);
      } else {
        this.addFavoriteProject(projectId);
      }
    },

    setProjectImages(obj) {
      this.projectImages = { ...this.projectImages, ...obj };
    },

    setProjectImage(projectId, imageUrl) {
      this.projectImages[projectId] = imageUrl;
    },

    setCreatorAvatars(obj) {
      this.creatorAvatars = { ...this.creatorAvatars, ...obj };
    },

    setCreatorAvatar(creatorId, avatarUrl) {
      this.creatorAvatars[creatorId] = avatarUrl;
    },

    setTabsDatas(arr) {
      this.tabsDatas = arr;
    },

    setTabsIndex(idx) {
      this.tabsIndex = idx;
    },

    setIsInitialized(val) {
      this.isInitialized = val;
    },

    // 重置分页
    resetPagination() {
      this.currentPage = 1;
      this.hasMore = true;
    },

    // 重置筛选
    resetFilters() {
      this.search = '';
      this.currentFilter = '';
      this.selectedCategories = [];
      this.sortBy = 'created_time';
      this.sortOrder = 'desc';
    },

    // 页面期望的方法
    async init() {
      console.log('初始化项目列表');
      this.isInitialized = true;
      this.currentPage = 1;
      this.hasMore = true;
      await this.getListFunction(true);
    },

    async getListFunction(refresh = false) {
      if (this.isLoading) return;

      try {
        this.isLoading = true;

        if (refresh) {
          this.currentPage = 1;
          this.globalData.list = [];
        }

        // 调用云函数获取项目列表
        console.log('开始获取项目列表...');

        // 获取用户ID（如果已登录）
        let userId = null;
        try {
          // 检查是否有session对象
          if (typeof uni !== 'undefined' && uni.$session && uni.$session.getUserValue) {
            userId = uni.$session.getUserValue('user_id');
          }
        } catch (e) {
          console.log('获取用户ID失败，使用匿名访问');
        }

        const res = await uniCloud.importObject('Project').getListForMainPage({
          user_id: userId
        });

        console.log('云函数返回数据:', res);

        if (res.status === 1 && res.data) {
          // 处理返回的数据，确保格式正确
          const projectList = res.data.map(item => ({
            ...item,
            id: item._id || item.id,
            project_name: item.title || item.project_name,
            project_description: item.description || item.project_description || '',
            creator_name: item.creator_name || '未知用户',
            type: item.type_name || item.type || '项目协作',
            person_needed: item.person_needed || 0,
            create_time: item.create_time,
            ending_time: item.ending_time,
            in_project: item.in_project || false
          }));

          if (this.currentPage === 1) {
            this.globalData.list = projectList;
          } else {
            this.globalData.list.push(...projectList);
          }

          // 主页API通常返回固定数量，没有分页
          this.hasMore = false;

          console.log(`成功加载 ${projectList.length} 个项目`);

        } else {
          console.warn('API返回状态异常:', res.status, res.msg);
          if (this.currentPage === 1) {
            this.globalData.list = [];
          }
          this.hasMore = false;
        }

      } catch (error) {
        console.error('获取项目列表失败:', error);

        // 如果是网络错误或云函数错误，显示具体错误信息
        let errorMsg = '获取项目列表失败';
        if (error.message) {
          errorMsg += ': ' + error.message;
        }

        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000
        });

        // 如果是第一次加载失败，确保列表为空
        if (this.currentPage === 1) {
          this.globalData.list = [];
        }
        this.hasMore = false;

      } finally {
        this.isLoading = false;
      }
    },

    handleSearch() {
      console.log('搜索项目:', this.search);
      this.getListFunction(true);
    },

    filterByType(type) {
      console.log('按类型筛选:', type);
      this.currentFilter = this.currentFilter === type ? '' : type;
      this.getListFunction(true);
    },

    clearFilter() {
      console.log('清除筛选');
      this.currentFilter = '';
      this.search = '';
      this.getListFunction(true);
    },

    showProjectDetailFunction(project) {
      console.log('显示项目详情:', project);
      this.globalData.showProjectDetail = project;
      this.modal = 'show';
    },

    openRequestModalFunction() {
      console.log('打开申请弹窗');
      this.modal = '';
      this.modal1 = 'show';
      this.self_introduce = '';
    },

    async requestToJoinFunction() {
      if (!this.self_introduce.trim()) {
        uni.showToast({
          title: '请填写自我介绍',
          icon: 'none'
        });
        return;
      }

      try {
        // 模拟API调用
        console.log('申请加入项目:', {
          project: this.globalData.showProjectDetail,
          introduce: this.self_introduce
        });

        uni.showToast({
          title: '申请已提交',
          icon: 'success'
        });

        this.modal1 = '';
        this.self_introduce = '';

      } catch (error) {
        console.error('申请失败:', error);
        uni.showToast({
          title: '申请失败，请重试',
          icon: 'none'
        });
      }
    },

    async loadMore() {
      if (!this.hasMore || this.isLoading) return;

      this.currentPage++;
      await this.getListFunction(false);
    },

    navigateToProjectDetail(project) {
      console.log('导航到项目详情:', project);
      this.showProjectDetailFunction(project);
    },

    navigateToUserList() {
      console.log('导航到用户列表');
      uni.navigateTo({
        url: '/pages/user/list'
      });
    },

    endingDateReturnFunction() {
      return Date.now();
    },

    getProjectDescription(project) {
      return project.project_description || project.description || '';
    },

    getCreatorAvatar(creatorId) {
      return this.creatorAvatars[creatorId] || '/static/default_avatar.png';
    },

    getProjectImage(projectId) {
      return this.projectImages[projectId] || '/static/default.png';
    },

    reset() {
      this.globalData = {
        list: [],
        showProjectDetail: {}
      };
      this.search = '';
      this.currentFilter = '';
      this.modal = '';
      this.modal1 = '';
      this.self_introduce = '';
      this.currentPage = 1;
      this.isLoading = false;
      this.hasMore = true;
      this.allProjects = [];
      this.projectList = {};
      this.projectImages = {};
      this.creatorAvatars = {};
      this.tabsDatas = [];
      this.tabsIndex = 0;
      this.isInitialized = false;
      this.searchKeyword = '';
      this.sortBy = 'created_time';
      this.sortOrder = 'desc';
      this.selectedCategories = [];
    }
  },

  // 持久化配置
  persist: {
    key: 'project-store',
    paths: ['favoriteProjects', 'projectImages', 'creatorAvatars', 'tabsIndex']
  }
}); 