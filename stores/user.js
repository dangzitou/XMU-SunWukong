import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userList: [],
    selectedProject: null,
    invitedUsers: [],
    userProjects: [],
    isLoading: false,
    searchKeyword: '',
    currentPage: 1,
    pageSize: 10,
    hasMore: true
  }),

  getters: {
    // 获取用户总数
    userCount: (state) => state.userList.length,

    // 获取已邀请用户总数
    invitedUserCount: (state) => state.invitedUsers.length,

    // 获取用户项目总数
    userProjectCount: (state) => state.userProjects.length,

    // 根据关键词过滤用户列表
    filteredUserList: (state) => {
      if (!state.searchKeyword) return state.userList;
      return state.userList.filter(user =>
        user.nickname?.includes(state.searchKeyword) ||
        user.username?.includes(state.searchKeyword) ||
        user.email?.includes(state.searchKeyword)
      );
    },

    // 获取选中项目信息
    selectedProjectInfo: (state) => {
      if (!state.selectedProject) return null;
      return {
        id: state.selectedProject.id,
        name: state.selectedProject.project_name,
        description: state.selectedProject.project_description,
        creator: state.selectedProject.creator_id
      };
    },

    // 检查用户是否已被邀请
    isUserInvited: (state) => (userId) => {
      return state.invitedUsers.some(user => user.id === userId);
    },

    // 获取用户在项目中的角色
    getUserProjectRole: (state) => (projectId, userId) => {
      const project = state.userProjects.find(p => p.id === projectId);
      if (!project) return null;
      const member = project.members?.find(m => m.user_id === userId);
      return member?.role || null;
    }
  },

  actions: {
    setUserList(list) {
      this.userList = list;
    },

    addUsers(users) {
      this.userList.push(...users);
    },

    setSelectedProject(project) {
      this.selectedProject = project;
    },

    setInvitedUsers(users) {
      this.invitedUsers = users;
    },

    addInvitedUser(user) {
      if (!this.isUserInvited(user.id)) {
        this.invitedUsers.push(user);
      }
    },

    removeInvitedUser(userId) {
      this.invitedUsers = this.invitedUsers.filter(user => user.id !== userId);
    },

    setUserProjects(projects) {
      this.userProjects = projects;
    },

    addUserProject(project) {
      const existingIndex = this.userProjects.findIndex(p => p.id === project.id);
      if (existingIndex >= 0) {
        this.userProjects[existingIndex] = project;
      } else {
        this.userProjects.push(project);
      }
    },

    removeUserProject(projectId) {
      this.userProjects = this.userProjects.filter(p => p.id !== projectId);
    },

    setIsLoading(val) {
      this.isLoading = val;
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

    // 重置分页
    resetPagination() {
      this.currentPage = 1;
      this.hasMore = true;
    },

    reset() {
      this.userList = [];
      this.selectedProject = null;
      this.invitedUsers = [];
      this.userProjects = [];
      this.isLoading = false;
      this.searchKeyword = '';
      this.currentPage = 1;
      this.pageSize = 10;
      this.hasMore = true;
    }
  },

  // 持久化配置
  persist: {
    key: 'user-store',
    paths: ['selectedProject', 'invitedUsers', 'userProjects']
  }
});