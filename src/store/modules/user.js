import { login, logout, getInfo, getRoleInfo } from "@/api/user";
import { getData } from "@/api/common";
import { getToken, setToken, removeToken } from "@/utils/auth";
import { resetRouter } from "@/router";
import store from "@/store";

const state = {
  token: getToken(),
  name: "",
  avatar: "",
  introduction: "",
  roles: [],
  userInfo: {},
  identity: "",
  isEliteAthlete: false, // 是否为精英版订阅用户
};

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction;
  },
  SET_NAME: (state, name) => {
    state.name = name;
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar;
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles;
  },
  SET_USER_INFO: (state, userInfo) => {
    state.userInfo = userInfo;
  },
  SET_IDENTITY: (state, identity) => {
    state.identity = identity;
  },
  SET_IS_ELITE_ATHLETE: (state, val) => {
    state.isEliteAthlete = val;
  },
};

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { loginAccount, password } = userInfo;
    return new Promise((resolve, reject) => {
      login({ openid: loginAccount.trim() })
        .then((response) => {
          const { token, nicknameTag, triUserId,webIdentityType } = response.result;
          commit("SET_TOKEN", token);
          commit("SET_NAME", nicknameTag);
          localStorage.setItem("name", nicknameTag);
          localStorage.setItem("triUserId", triUserId);
          localStorage.setItem("webIdentityType", webIdentityType);
          const loginType = webIdentityType && webIdentityType === "C" ? "2" : "1";
          localStorage.setItem("loginType", loginType);
          setToken(token);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // get user info
  getInfo({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token)
        .then((response) => {
          const { result: data } = response;

          if (!data) {
            reject("请重新登录");
          }

          const { userInfo } = data;

          getRoleInfo({ roleId: userInfo.roleId }).then((res) => {
            commit("SET_ROLES", res.result.menuOperationDtoList);
            commit("SET_NAME", userInfo.userName);
            commit("SET_USER_INFO", userInfo);
            // store.dispatch("common/getOptions");
            resolve({ ...data, roleInfo: res.result });
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      // logout(state.token)
      //   .then(() => {
      commit("SET_TOKEN", "");
      commit("SET_ROLES", []);
      commit("SET_NAME", "");
      localStorage.removeItem("name");
      localStorage.removeItem("triUserId");
      store.commit("userInfo/RESET_INFO");
      store.commit("permission/SET_ROLES", []);
      removeToken();
      resetRouter();
      localStorage.clear();

      // reset visited views and cached views
      // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
      // dispatch("tagsView/delAllViews", null, { root: true });

      resolve();
      // })
      // .catch((error) => {
      //   reject(error);
      // });
    });
  },

  // remove token
  resetToken({ commit }) {
    return new Promise((resolve) => {
      commit("SET_TOKEN", "");
      commit("SET_ROLES", []);
      removeToken();
      store.commit("permission/SET_ROLES", []);
      store.commit("userInfo/RESET_INFO");
      localStorage.clear();
      resolve();
    });
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    // const token = role + "-token";
    // commit("SET_TOKEN", token);
    // setToken(token);
    // const { roles } = await dispatch("getInfo");
    // resetRouter();
    // generate accessible routes map based on roles
    // const accessRoutes = await dispatch("permission/generateRoutes", roles, {
    //   root: true,
    // });
    // // dynamically add accessible routes
    // router.addRoutes(accessRoutes);
    // // reset visited views and cached views
    // dispatch("tagsView/delAllViews", null, { root: true });
  },
  changeIdentify({ commit }, identity) {
    commit("SET_IDENTITY", identity);
  },
  /**
   * 查询精英版订阅状态
   * - 非运动员身份（loginType !== "1"）默认视为精英版
   * - 运动员身份通过接口查询 identityType === "R" 且 subStatus === 1 判断
   */
  async checkEliteSubscription({ commit }) {
    const loginType = localStorage.getItem("loginType");
    if (loginType !== "1") {
      commit("SET_IS_ELITE_ATHLETE", true);
      return;
    }
    try {
      const res = await getData({
        url: "operate/api/vipSubscribe/getUserSubscribeInfo",
      });
      if (res && res.success && Array.isArray(res.result)) {
        const eliteInfo = res.result.find(
          (item) => item.identityType === "R"
        );
        commit("SET_IS_ELITE_ATHLETE", !!(eliteInfo && eliteInfo.subStatus === 1));
      }
    } catch (e) {
      console.warn("查询精英版订阅状态失败:", e);
      commit("SET_IS_ELITE_ATHLETE", false);
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
