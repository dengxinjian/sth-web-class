const state = {
  planData: null,
};

const mutations = {
  SET_PLAN_DATA: (state, data) => {
    state.planData = data;
  },
  RESET_PLAN_DATA: (state) => {
    state.planData = null;
  },
};

const actions = {
  savePlanData({ commit }, data) {
    commit("SET_PLAN_DATA", data);
  },
  resetPlanData({ commit }) {
    commit("RESET_PLAN_DATA");
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};

