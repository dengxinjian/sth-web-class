import router from "./router";
import store from "./store";
import { Message } from "element-ui";
import NProgress from "nprogress"; // progress bar
import "nprogress/nprogress.css"; // progress bar style
import { getToken } from "@/utils/auth"; // get token from cookie
import getPageTitle from "@/utils/get-page-title";

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const whiteList = ["/login", '/login-wx', '/login-scan', '/agreement', '/privacy' ,'/login-cd']; // no redirect whitelist

router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start();

  // set page title
  document.title = getPageTitle(to.meta.title);

  // determine whether the user has logged in
  const hasToken = getToken();

  console.log('路由守卫触发:', { to: to.path, from: from.path, hasToken });

  if (hasToken) {
    if (to.path === "/login") {
      // if is logged in, redirect to the home page
      console.log('已登录用户访问登录页，重定向到首页');
      next({ path: "/" });
      NProgress.done(); // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      // determine whether the user has obtained his permission roles through getInfo
      const hasRoles = store.getters.roles && store.getters.roles.length > 0;
      console.log('检查角色:', { hasRoles, roles: store.getters.roles });

      if (hasRoles) {
        console.log('有角色，直接通过');
        next();
      } else {
        try {
          console.log('没有角色，开始生成路由');

          // 设置一个默认角色，避免死循环
          if (!store.getters.roles || store.getters.roles.length === 0) {
            console.log('设置默认角色');
            store.commit('user/SET_ROLES', ['admin']);
          }

          // generate accessible routes map based on roles
          const accessRoutes = await store.dispatch(
            "permission/generateRoutes"
          );

          console.log('生成的路由:', accessRoutes);
          // dynamically add accessible routes
          router.addRoutes(accessRoutes);

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          console.log('路由添加完成，重新导航');
          next({ ...to, replace: true });
        } catch (error) {
          console.error('路由生成失败:', error);
          // remove token and go to login page to re-login
          await store.dispatch("user/resetToken");
          Message.error(error || "Has Error");
          next(`/login?redirect=${to.path}`);
          NProgress.done();
        }
      }
    }
  } else {
    /* has no token*/
    console.log('没有token，检查白名单');
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      console.log('在白名单中，直接通过');
      next();
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      console.log('不在白名单中，重定向到登录页');
      next(`/login?redirect=${to.path}`);
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  // finish progress bar
  NProgress.done();
});
