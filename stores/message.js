import { defineStore } from 'pinia';

export const useMessageStore = defineStore('message', {
  state: () => ({
    messageList: [],
    systemMessages: [],
    inviteMessages: [],
    requestMessages: [],
    isLoading: false,
    unreadCount: 0,
    lastReadTime: null,
    messageFilter: 'all' // all, unread, system, invite, request
  }),

  getters: {
    // 获取未读消息数量
    unreadMessageCount: (state) => {
      return state.messageList.filter(msg => !msg.is_read).length;
    },

    // 获取未读系统消息数量
    unreadSystemCount: (state) => {
      return state.systemMessages.filter(msg => !msg.is_read).length;
    },

    // 获取未读邀请消息数量
    unreadInviteCount: (state) => {
      return state.inviteMessages.filter(msg => !msg.is_read).length;
    },

    // 获取未读请求消息数量
    unreadRequestCount: (state) => {
      return state.requestMessages.filter(msg => !msg.is_read).length;
    },

    // 获取总未读数量
    totalUnreadCount: (state) => {
      return state.unreadSystemCount + state.unreadInviteCount + state.unreadRequestCount;
    },

    // 根据筛选条件过滤消息
    filteredMessages: (state) => {
      switch (state.messageFilter) {
        case 'unread':
          return state.messageList.filter(msg => !msg.is_read);
        case 'system':
          return state.systemMessages;
        case 'invite':
          return state.inviteMessages;
        case 'request':
          return state.requestMessages;
        default:
          return state.messageList;
      }
    },

    // 获取最新消息
    latestMessage: (state) => {
      if (state.messageList.length === 0) return null;
      return state.messageList.sort((a, b) =>
        new Date(b.created_time) - new Date(a.created_time)
      )[0];
    }
  },

  actions: {
    setMessageList(list) {
      this.messageList = list;
      this.updateUnreadCount();
    },

    addMessage(message) {
      this.messageList.unshift(message);
      this.updateUnreadCount();
    },

    updateMessage(messageId, updates) {
      const index = this.messageList.findIndex(msg => msg.id === messageId);
      if (index >= 0) {
        this.messageList[index] = { ...this.messageList[index], ...updates };
      }
      this.updateUnreadCount();
    },

    removeMessage(messageId) {
      this.messageList = this.messageList.filter(msg => msg.id !== messageId);
      this.systemMessages = this.systemMessages.filter(msg => msg.id !== messageId);
      this.inviteMessages = this.inviteMessages.filter(msg => msg.id !== messageId);
      this.requestMessages = this.requestMessages.filter(msg => msg.id !== messageId);
      this.updateUnreadCount();
    },

    setSystemMessages(list) {
      this.systemMessages = list;
      this.updateUnreadCount();
    },

    setInviteMessages(list) {
      this.inviteMessages = list;
      this.updateUnreadCount();
    },

    setRequestMessages(list) {
      this.requestMessages = list;
      this.updateUnreadCount();
    },

    setIsLoading(val) {
      this.isLoading = val;
    },

    setMessageFilter(filter) {
      this.messageFilter = filter;
    },

    // 标记消息为已读
    markAsRead(messageId) {
      this.updateMessage(messageId, { is_read: true });
    },

    // 标记所有消息为已读
    markAllAsRead() {
      this.messageList.forEach(msg => {
        if (!msg.is_read) {
          msg.is_read = true;
        }
      });
      this.systemMessages.forEach(msg => {
        if (!msg.is_read) {
          msg.is_read = true;
        }
      });
      this.inviteMessages.forEach(msg => {
        if (!msg.is_read) {
          msg.is_read = true;
        }
      });
      this.requestMessages.forEach(msg => {
        if (!msg.is_read) {
          msg.is_read = true;
        }
      });
      this.lastReadTime = new Date().toISOString();
      this.updateUnreadCount();
    },

    // 更新未读数量
    updateUnreadCount() {
      this.unreadCount = this.totalUnreadCount;
    },

    // 处理邀请消息
    handleInviteMessage(messageId, action) {
      const message = this.inviteMessages.find(msg => msg.id === messageId);
      if (message) {
        message.status = action; // 'accepted' or 'rejected'
        message.is_read = true;
        this.updateUnreadCount();
      }
    },

    // 处理请求消息
    handleRequestMessage(messageId, action) {
      const message = this.requestMessages.find(msg => msg.id === messageId);
      if (message) {
        message.status = action; // 'approved' or 'rejected'
        message.is_read = true;
        this.updateUnreadCount();
      }
    },

    reset() {
      this.messageList = [];
      this.systemMessages = [];
      this.inviteMessages = [];
      this.requestMessages = [];
      this.isLoading = false;
      this.unreadCount = 0;
      this.lastReadTime = null;
      this.messageFilter = 'all';
    }
  },

  // 持久化配置
  persist: {
    key: 'message-store',
    paths: ['lastReadTime', 'messageFilter']
  }
});