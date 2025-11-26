import Vue from "vue";
import Vuex from "vuex";
import getters from "./getters";
import createPersistedstate from "vuex-persistedstate";

Vue.use(Vuex);

// https://webpack.js.org/guides/dependency-management/#requirecontext
const modulesFiles = require.context("./modules", true, /\.js$/);

// you do not need `import app from './modules/app'`
// it will auto require all vuex module from modules file
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  // set './app.js' => 'app'
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, "$1");
  const value = modulesFiles(modulePath);
  modules[moduleName] = value.default;
  return modules;
}, {});

const store = new Vuex.Store({
  state: {
    fromPath: "",
  },
  mutations: {
    SET_FROM_PATH: (state, fromPath) => {
      state.fromPath = fromPath;
    },
  },
  actions: {
    setFromPath({ commit }, fromPath) {
      commit("SET_FROM_PATH", fromPath);
    },
  },
  modules,
  getters,
  plugins: [createPersistedstate({ paths: ["userInfo", "plan"] })],
});

export default store;
