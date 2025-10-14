import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

// 环境配置
const config = {
  development: {
    loginComponent: () => import("@/views/login/index")
  },
  staging: {
    loginComponent: () => import("@/views/login-wx/index"),
  },
  production: {
    loginComponent: () => import("@/views/login-wx/index"),
  },
  test: {
    loginComponent: () => import("@/views/login-wx/index"),
  },
};

// 获取当前环境配置，默认为开发环境
const currentConfig = config[process.env.NODE_ENV] || config.development;

/* Layout */
import Layout from "@/layout";
import TopLayout from "@/layout/TopLayout.vue";

/* Router Modules */
import componentsRouter from "./modules/components";
import chartsRouter from "./modules/charts";
import tableRouter from "./modules/table";
import nestedRouter from "./modules/nested";
import VueRouter from "vue-router";

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: "/redirect",
    component: Layout,
    hidden: true,
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index"),
      },
    ],
  },
  {
    path: "/login",
    component: currentConfig.loginComponent,
    hidden: true,
  },
  {
    path: "/login-scan",
    component: () => import("@/views/login-wx/scan"),
    hidden: true,
  },
  {
    path: "/agreement",
    component: () => import("@/views/agreement/index"),
    hidden: true,
  },
  {
    path: "/privacy",
    component: () => import("@/views/privacy/index"),
    hidden: true,
  },
  {
    path: "/auth-redirect",
    component: () => import("@/views/login/auth-redirect"),
    hidden: true,
  },
  {
    path: "/404",
    component: () => import("@/views/error-page/404"),
    hidden: true,
  },
  {
    path: "/401",
    component: () => import("@/views/error-page/401"),
    hidden: true,
  },

  // {
  //   path: "/documentation",
  //   component: Layout,
  //   children: [
  //     {
  //       path: "index",
  //       component: () => import("@/views/documentation/index"),
  //       name: "Documentation",
  //       meta: { title: "documentation", icon: "documentation", affix: true },
  //     },
  //   ],
  // },
  // {
  //   path: "/guide",
  //   component: Layout,
  //   redirect: "/guide/index",
  //   children: [
  //     {
  //       path: "index",
  //       component: () => import("@/views/guide/index"),
  //       name: "Guide",
  //       meta: { title: "guide", icon: "guide", noCache: true },
  //     },
  //   ],
  // },
  // {
  //   path: "/profile",
  //   component: Layout,
  //   redirect: "/profile/index",
  //   hidden: true,
  //   children: [
  //     {
  //       path: "index",
  //       component: () => import("@/views/profile/index"),
  //       name: "Profile",
  //       meta: { title: "profile", icon: "user", noCache: true },
  //     },
  //   ],
  // },
];

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: "/",
    component: Layout,
    redirect: "/timeTable/athletic",
  },
  {
    path: "/timeTable",
    component: TopLayout,
    redirect: "/timeTable/athletic",
    alwaysShow: false,
    meta: { title: "课表查看", icon: "el-icon-setting" },
    children: [
      {
        path: "athletic",
        component: () => import("@/views/classManagement/index"),
        meta: { title: "课表管理" },
      },
      {
        path: "/class-management-test",
        component: () => import("@/views/classManagement/index-refactored.vue"),
        meta: { title: "课程管理（测试）", icon: "education" },
      },
    ],
  },

  // {
  //   path: "/systemManage",
  //   component: Layout,
  //   name: "sys-manage-parent",
  //   redirect: "/systemManage/userManage",
  //   alwaysShow: true,
  //   meta: { title: "系统管理", icon: "el-icon-setting" },
  //   children: [
  //     {
  //       path: "/systemManage/userManage",
  //       component: () => import("@/views/userManage/index"),
  //       name: "sys-manage-user",
  //       meta: { title: "用户管理" },
  //     },
  //     {
  //       path: "/systemManage/rolesManage",
  //       component: () => import("@/views/rolesManage/index"),
  //       name: "sys-manage-role",
  //       meta: { title: "角色管理" },
  //     },
  //     {
  //       path: "/systemManage/systemConfig",
  //       component: () => import("@/views/SystemConfig/index"),
  //       name: "system_config",
  //       meta: { title: "系统配置" },
  //     },
  //     {
  //       path: "/systemManage/authConfig",
  //       component: () => import("@/views/rolesManage/auth"),
  //       name: "system-manage-role-auth",
  //       hidden: true,
  //       meta: { title: "权限配置" },
  //     },
  //   ],
  // },
  {
    path: "/updatePassword",
    component: Layout,
    redirect: "/updatePassword/index",
    meta: { title: "修改密码" },
    hidden: true,
    children: [
      {
        path: "index",
        component: () => import("@/views/updatePassword/index"),
        hidden: true,
        meta: { title: "修改密码" },
      },
    ],
  },

  // 404 page must be placed at the end !!!
  { path: "*", redirect: "/404", hidden: true },
];

const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes,
  });

const router = createRouter();

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}

export default router;
