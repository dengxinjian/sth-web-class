import Cookies from "js-cookie";
import { getLanguage } from "@/lang/index";

const state = {
  sidebar: {
    opened: Cookies.get("sidebarStatus")
      ? !!+Cookies.get("sidebarStatus")
      : true,
    withoutAnimation: false,
  },
  device: "desktop",
  language: getLanguage(),
  size: Cookies.get("size") || "medium",
  maintenance: {
    visible: false,
    message: "系统升级中，请稍后再试",
  },
};

const mutations = {
  TOGGLE_SIDEBAR: (state) => {
    state.sidebar.opened = !state.sidebar.opened;
    state.sidebar.withoutAnimation = false;
    if (state.sidebar.opened) {
      Cookies.set("sidebarStatus", 1);
    } else {
      Cookies.set("sidebarStatus", 0);
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set("sidebarStatus", 1);
    state.sidebar.opened = false;
    state.sidebar.withoutAnimation = withoutAnimation;
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device;
  },
  SET_LANGUAGE: (state, language) => {
    state.language = language;
    Cookies.set("language", language);
  },
  SET_SIZE: (state, size) => {
    state.size = size;
    Cookies.set("size", size);
  },
  SET_MAINTENANCE: (state, payload = {}) => {
    const { visible, message } = payload || {};
    if (typeof visible === "boolean") {
      state.maintenance.visible = visible;
    }
    if (typeof message === "string" && message.trim()) {
      state.maintenance.message = message;
    }
  },
};

const actions = {
  toggleSideBar({ commit }) {
    commit("TOGGLE_SIDEBAR");
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit("CLOSE_SIDEBAR", withoutAnimation);
  },
  toggleDevice({ commit }, device) {
    commit("TOGGLE_DEVICE", device);
  },
  setLanguage({ commit }, language) {
    commit("SET_LANGUAGE", language);
  },
  setSize({ commit }, size) {
    commit("SET_SIZE", size);
  },
  setMaintenance({ commit }, payload) {
    commit("SET_MAINTENANCE", payload);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
