import { asyncRoutes, constantRoutes } from "@/router";

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function normalizeRole(roles) {
  let rolesList = [];
  roles.forEach((item) => {
    rolesList.push(item.code);
    if (item.childMenu && item.childMenu.length > 0) {
      const r = normalizeRole(item.childMenu);
      rolesList = [...rolesList, ...r];
    }
  });
  return rolesList;
}

function hasPermission(roles, route) {
  const r = normalizeRole(roles);
  if (route.name === "system-manage-role-auth") {
    return true;
  }
  if (route.name) {
    return r.includes(route.name);
  } else {
    return true;
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = [];

  routes.forEach((route) => {
    const tmp = { ...route };
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles);
      }
      res.push(tmp);
    }
  });
  const getSon = (data) => {
    if (data.children && data.children.length > 0) {
      return getSon(data.children[0]);
    }
    return data.path;
  };
  res.forEach((item) => {
    if (item.path === "/") {
      // if (res[1].children && res[1].children.length > 0) {
      //   item.redirect = res[1].children[0].path;
      // } else {
      //   item.redirect = res[1].path;
      // }
      const path = getSon(res[1]);
      item.redirect = path;
    }
  });
  return res;
}

const state = {
  routes: [],
  addRoutes: [],
};

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes;
    state.routes = constantRoutes.concat(routes);
  },
};

const actions = {
  generateRoutes({ commit }) {
    return new Promise((resolve) => {
      // let accessedRoutes;
      // if (roles.includes("admin")) {
      const accessedRoutes = asyncRoutes || [];
      // } else {
      //   accessedRoutes = filterAsyncRoutes(asyncRoutes, roles);
      // }
      // const accessedRoutes = filterAsyncRoutes(
      //   asyncRoutes,
      //   roles.menuOperationDtoList
      // );
      commit("SET_ROUTES", accessedRoutes);
      resolve(accessedRoutes);
    });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
