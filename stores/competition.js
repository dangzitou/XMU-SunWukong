import { defineStore } from 'pinia';

export const useCompetitionStore = defineStore('competition', {
  state: () => ({
    competitionList: [],
    competitionDetail: {},
    competitionProjects: [],
    isLoading: false,
    currentFilter: 'all', // all, ongoing, upcoming, ended
    searchKeyword: '',
    myCompetitions: []
  }),

  getters: {
    // 根据状态过滤竞赛
    filteredCompetitions: (state) => {
      let competitions = state.competitionList;

      // 关键词搜索
      if (state.searchKeyword) {
        competitions = competitions.filter(comp =>
          comp.name?.includes(state.searchKeyword) ||
          comp.description?.includes(state.searchKeyword)
        );
      }

      // 状态筛选
      const now = new Date();
      switch (state.currentFilter) {
        case 'ongoing':
          return competitions.filter(comp =>
            new Date(comp.start_time) <= now && new Date(comp.end_time) >= now
          );
        case 'upcoming':
          return competitions.filter(comp => new Date(comp.start_time) > now);
        case 'ended':
          return competitions.filter(comp => new Date(comp.end_time) < now);
        default:
          return competitions;
      }
    },

    // 获取我参与的竞赛
    myParticipatedCompetitions: (state) => {
      return state.competitionList.filter(comp =>
        state.myCompetitions.includes(comp.id)
      );
    },

    // 获取竞赛状态
    getCompetitionStatus: () => (competition) => {
      const now = new Date();
      const startTime = new Date(competition.start_time);
      const endTime = new Date(competition.end_time);

      if (now < startTime) return 'upcoming';
      if (now > endTime) return 'ended';
      return 'ongoing';
    }
  },

  actions: {
    setCompetitionList(list) {
      this.competitionList = list;
    },

    setCompetitionDetail(detail) {
      this.competitionDetail = detail;
    },

    setCompetitionProjects(projects) {
      this.competitionProjects = projects;
    },

    setIsLoading(val) {
      this.isLoading = val;
    },

    setCurrentFilter(filter) {
      this.currentFilter = filter;
    },

    setSearchKeyword(keyword) {
      this.searchKeyword = keyword;
    },

    setMyCompetitions(competitions) {
      this.myCompetitions = competitions;
    },

    addMyCompetition(competitionId) {
      if (!this.myCompetitions.includes(competitionId)) {
        this.myCompetitions.push(competitionId);
      }
    },

    removeMyCompetition(competitionId) {
      this.myCompetitions = this.myCompetitions.filter(id => id !== competitionId);
    },

    reset() {
      this.competitionList = [];
      this.competitionDetail = {};
      this.competitionProjects = [];
      this.isLoading = false;
      this.currentFilter = 'all';
      this.searchKeyword = '';
    }
  },

  // 持久化配置
  persist: {
    key: 'competition-store',
    paths: ['myCompetitions']
  }
});