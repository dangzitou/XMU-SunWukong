import { defineStore } from 'pinia';

export const useInProjectStore = defineStore('inProject', {
  state: () => ({
    selfProjects: [],
    otherProjects: [],
    isLoading: false,
    currentTab: 'self', // self, other
    searchKeyword: ''
  }),

  getters: {
    // 获取所有项目
    allProjects: (state) => [...state.selfProjects, ...state.otherProjects],

    // 根据搜索关键词过滤自己的项目
    filteredSelfProjects: (state) => {
      if (!state.searchKeyword) return state.selfProjects;
      return state.selfProjects.filter(project =>
        project.project_name?.includes(state.searchKeyword) ||
        project.project_description?.includes(state.searchKeyword)
      );
    },

    // 根据搜索关键词过滤其他项目
    filteredOtherProjects: (state) => {
      if (!state.searchKeyword) return state.otherProjects;
      return state.otherProjects.filter(project =>
        project.project_name?.includes(state.searchKeyword) ||
        project.project_description?.includes(state.searchKeyword)
      );
    },

    // 获取当前标签页的项目
    currentTabProjects: (state) => {
      return state.currentTab === 'self' ?
        state.filteredSelfProjects :
        state.filteredOtherProjects;
    },

    // 获取项目统计
    projectStats: (state) => ({
      selfCount: state.selfProjects.length,
      otherCount: state.otherProjects.length,
      totalCount: state.selfProjects.length + state.otherProjects.length
    })
  },

  actions: {
    setSelfProjects(list) {
      this.selfProjects = list;
    },

    setOtherProjects(list) {
      this.otherProjects = list;
    },

    addSelfProject(project) {
      const existingIndex = this.selfProjects.findIndex(p => p.id === project.id);
      if (existingIndex >= 0) {
        this.selfProjects[existingIndex] = project;
      } else {
        this.selfProjects.push(project);
      }
    },

    addOtherProject(project) {
      const existingIndex = this.otherProjects.findIndex(p => p.id === project.id);
      if (existingIndex >= 0) {
        this.otherProjects[existingIndex] = project;
      } else {
        this.otherProjects.push(project);
      }
    },

    removeSelfProject(projectId) {
      this.selfProjects = this.selfProjects.filter(p => p.id !== projectId);
    },

    removeOtherProject(projectId) {
      this.otherProjects = this.otherProjects.filter(p => p.id !== projectId);
    },

    setIsLoading(val) {
      this.isLoading = val;
    },

    setCurrentTab(tab) {
      this.currentTab = tab;
    },

    setSearchKeyword(keyword) {
      this.searchKeyword = keyword;
    },

    reset() {
      this.selfProjects = [];
      this.otherProjects = [];
      this.isLoading = false;
      this.currentTab = 'self';
      this.searchKeyword = '';
    }
  },

  // 持久化配置
  persist: {
    key: 'in-project-store',
    paths: ['currentTab']
  }
});