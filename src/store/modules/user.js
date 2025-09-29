import { login, logout, getInfo, getRoleInfo } from "@/api/user";
import { getToken, setToken, removeToken } from "@/utils/auth";
import router, { resetRouter } from "@/router";
import store from "@/store";
import { identity } from "lodash";

const state = {
  token: getToken(),
  name: "",
  avatar: "",
  introduction: "",
  roles: [],
  userInfo: {},
  identity: "",
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
};

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { loginAccount, password } = userInfo;
    return new Promise((resolve, reject) => {
      login({ username: loginAccount.trim() })
        .then((response) => {
          const { token, nicknameTag } = response;
          commit("SET_TOKEN", token);
          commit("SET_NAME", nicknameTag);
          localStorage.setItem('name', nicknameTag);
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
      localStorage.removeItem('name');
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
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
