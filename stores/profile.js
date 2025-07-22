import { defineStore } from 'pinia';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: {},
    isEditing: false,
    isLoading: false,
    editingFields: [], // 正在编辑的字段
    originalProfile: {}, // 编辑前的原始数据
    uploadingAvatar: false
  }),

  getters: {
    // 获取用户头像
    userAvatar: (state) => {
      return state.profile.avatar || '/static/default_avatar.png';
    },

    // 获取用户昵称
    userName: (state) => {
      return state.profile.nickname || state.profile.username || '未设置';
    },

    // 获取用户邮箱
    userEmail: (state) => {
      return state.profile.email || '未设置';
    },

    // 获取用户手机号
    userPhone: (state) => {
      return state.profile.phone || '未设置';
    },

    // 检查资料完整度
    profileCompleteness: (state) => {
      const requiredFields = ['nickname', 'email', 'phone', 'avatar'];
      const completedFields = requiredFields.filter(field =>
        state.profile[field] && state.profile[field].trim() !== ''
      );
      return Math.round((completedFields.length / requiredFields.length) * 100);
    },

    // 检查是否有未保存的更改
    hasUnsavedChanges: (state) => {
      if (!state.isEditing) return false;
      return JSON.stringify(state.profile) !== JSON.stringify(state.originalProfile);
    },

    // 获取用户统计信息
    userStats: (state) => ({
      projectCount: state.profile.project_count || 0,
      joinedProjectCount: state.profile.joined_project_count || 0,
      messageCount: state.profile.message_count || 0,
      registerDays: state.profile.created_time ?
        Math.floor((Date.now() - new Date(state.profile.created_time)) / (1000 * 60 * 60 * 24)) : 0
    })
  },

  actions: {
    setProfile(profile) {
      this.profile = profile;
      if (!this.isEditing) {
        this.originalProfile = { ...profile };
      }
    },

    updateProfile(updates) {
      this.profile = { ...this.profile, ...updates };
    },

    setIsEditing(val) {
      this.isEditing = val;
      if (val) {
        // 开始编辑时保存原始数据
        this.originalProfile = { ...this.profile };
      } else {
        // 结束编辑时清空编辑字段
        this.editingFields = [];
      }
    },

    setIsLoading(val) {
      this.isLoading = val;
    },

    setUploadingAvatar(val) {
      this.uploadingAvatar = val;
    },

    // 开始编辑特定字段
    startEditingField(field) {
      if (!this.editingFields.includes(field)) {
        this.editingFields.push(field);
      }
    },

    // 停止编辑特定字段
    stopEditingField(field) {
      this.editingFields = this.editingFields.filter(f => f !== field);
    },

    // 取消编辑，恢复原始数据
    cancelEditing() {
      this.profile = { ...this.originalProfile };
      this.isEditing = false;
      this.editingFields = [];
    },

    // 保存编辑
    saveEditing() {
      this.originalProfile = { ...this.profile };
      this.isEditing = false;
      this.editingFields = [];
    },

    // 更新头像
    updateAvatar(avatarUrl) {
      this.profile.avatar = avatarUrl;
    },

    // 更新用户统计
    updateUserStats(stats) {
      this.profile = { ...this.profile, ...stats };
    },

    reset() {
      this.profile = {};
      this.isEditing = false;
      this.isLoading = false;
      this.editingFields = [];
      this.originalProfile = {};
      this.uploadingAvatar = false;
    }
  },

  // 持久化配置
  persist: {
    key: 'profile-store',
    paths: ['profile']
  }
});